# agents.md — Society Management System (GSTechSystem)

> This file is the authoritative context document for any AI tool working on this codebase.
> Read it fully before generating any code, suggesting any architecture, or reviewing any PR.

---

## 1. Project Overview

A **multi-tenant SaaS platform** for HOA (Homeowners Association) property management. Each HOA company is a **tenant**. The platform admin manages tenants; each tenant admin manages their own associations, owners, communication, accounting, and more.

**GitHub:** `Saurabh240/society-management-system`
**Stack:** Spring Boot 3 backend + React/Vite frontend + PostgreSQL + Kafka

---

## 2. Tech Stack — Exact Versions

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.2.5 (Jakarta EE) | Core framework |
| Spring Data JPA / Hibernate | Boot-managed | ORM |
| PostgreSQL | 42.6.0 driver | Primary database |
| Flyway | 9.22.3 | DB migrations (`spring.flyway.enabled=false` in dev — run manually) |
| Spring Security | Boot-managed | JWT-based auth |
| JJWT | 0.11.5 | JWT generation/validation |
| Spring Kafka | Boot-managed | Async communication dispatch |
| Mailjet | 6.0.1 | Email delivery |
| Twilio | 9.1.2 | SMS delivery |
| Lombok | 1.18.30 | Boilerplate reduction |
| SpringDoc OpenAPI | 2.1.0 | Swagger UI at `/swagger-ui.html` |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.0 | UI framework |
| Vite | 7.2.4 | Build tool |
| React Router DOM | 7.13.0 | Routing |
| Axios | 1.13.5 | HTTP client |
| Tailwind CSS | 4.1.18 | Styling |
| Lucide React | 0.563.0 | Icons |
| React Toastify | 11.0.5 | Toast notifications |
| dayjs | latest | Date formatting / date range presets in Ledger and Bills |
| react-select | latest | Multi-select account dropdown in GeneralLedgerTab |

### Infrastructure (Docker Compose)
- PostgreSQL 15
- Kafka (confluentinc/cp-kafka:7.5.0) + Zookeeper (confluentinc/cp-zookeeper:7.5.0)
- Backend image: `saurabh896/society-backend:latest`
- Frontend image: `saurabh896/society-frontend:latest`

---

## 3. Multi-Tenancy Architecture (Critical — read before writing any code)

### How it works
1. Every HTTP request goes through `TenantFilter` (runs before `JwtFilter`)
2. `TenantFilter` resolves `tenantId` from the request via `TenantResolver` and calls `TenantContext.set(tenantId)`
3. `TenantContext` is a `ThreadLocal<Long>` — available anywhere in the request thread
4. `JwtFilter` then validates the JWT and checks `tokenTenantId == TenantContext.get()` (except for PLATFORM_ADMIN)
5. After the request, `TenantContext.clear()` is called in a finally block

### BaseEntity — ALL entities must extend this
```java
@MappedSuperclass
@SuperBuilder @NoArgsConstructor @AllArgsConstructor @Getter @Setter
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @Column(nullable = false, updatable = false)
    private Long tenantId;

    @CreatedDate
    @Column(updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onPrePersist() {
        if (tenantId == null) tenantId = TenantContext.get(); // AUTO-SET
        if (createdAt == null) createdAt = Instant.now();
    }
}
```

**Rule:** Any entity that does NOT extend `BaseEntity` will cause cross-tenant data leakage.

**Rule:** Any entity extending `BaseEntity` MUST use `@SuperBuilder` (not `@Builder`) because `@Builder`
on a subclass of `@SuperBuilder` generates a broken builder that does not inherit the parent fields.
`Coa.java` currently violates this — it uses `@Builder` instead of `@SuperBuilder`.

### Fetching in services — always scope by tenantId
```java
// CORRECT
repository.findByTenantId(TenantContext.get());

// WRONG — returns data from all tenants
repository.findAll();
```

---

## 4. API Response Contract (Critical — all responses use this wrapper)

Every API endpoint returns `ApiResponse<T>` — **with the following known exceptions**:

```java
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String error;
    private String errorCode;

    public static <T> ApiResponse<T> success(T data) { ... }
    public static ApiResponse<?> error(String code, String message) { ... }
}
```

**On the frontend**, the actual payload is at `res.data.data` for controllers that wrap in `ApiResponse`:
```js
const res = await httpClient.get("/api/v1/accounting/overview");
const stats = res.data.data; // ApiResponse wrapper → unwrap .data
```

### ⚠️ CRITICAL EXCEPTIONS — controllers that do NOT wrap in ApiResponse

| Controller | Response type | Frontend reads |
|---|---|---|
| `CoaController` (GET list) | `Page<CoaResponse>` directly | `res.data.content` |
| `LedgerController` | `Page<LedgerEntryResponse>` directly | `res.data.content` |
| `BillController` (all endpoints) | Raw types (`Page<BillResponse>`, `BillResponse`, `BillSummaryResponse`) | `res.data.content` or `res.data` |
| `VendorController` (GET list) | `ResponseEntity<List<Vendor>>` directly | `res.data` (array) |

All other controllers (Banking, Journal, Overview, Association, Communication) use `ApiResponse.success()`.
**The asymmetry is a frequent source of bugs in team PRs — check this table before writing any response unwrap.**

---

## 5. Security Model

### Route protection
```
Public:        /users/register, /users/login, /users/refresh, /swagger-ui/**, /actuator/**
Platform only: /platform/** (requires ROLE_PLATFORM_ADMIN)
Authenticated: /api/v1/** (any valid JWT)
```

### Roles
- `PLATFORM_ADMIN` — manages tenants, not bound to a single tenant
- `TENANT_ADMIN` — manages one tenant's HOA data

### JWT Claims
Token contains: `tenantId`, `role`, `userId`, `sub` (email)

`userId` is injected as a request attribute `x-user-id` by `JwtFilter`:
```java
@RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId
```

### Auth flow
- Login → short-lived access token (JSON body) + long-lived refresh token (HttpOnly cookie, path `/users/refresh`)
- Refresh → `POST /users/refresh` with cookie → new access token
- Frontend stores access token in `localStorage.accessToken` via `storage.js`

---

## 6. Backend Code Patterns

### Controller pattern
```java
@RestController
@RequestMapping("/api/v1/accounting/banking")
@RequiredArgsConstructor
@Tag(name = "Banking", description = "Banking APIs")
public class BankingController {
    private final BankingService bankingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BankAccountResponse>>> list(
            @RequestParam(required = false) Long associationId) {
        return ResponseEntity.ok(ApiResponse.success(bankingService.listAccounts(associationId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BankAccountResponse>> create(
            @Valid @RequestBody BankAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(bankingService.createAccount(request)));
    }
}
```

**Critical routing rule:** When a controller has both `@GetMapping("/summary")` and `@GetMapping("/{id}")`,
`/summary` MUST be declared BEFORE `/{id}` in the source file. Otherwise Spring matches "summary" as an
ID path variable and throws `NumberFormatException`. `BillController` currently violates this.

### Service pattern
```java
@Service
@RequiredArgsConstructor
@Transactional
public class BankingServiceImpl implements BankingService {
    private final BankingRepository bankingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BankAccountResponse> listAccounts(Long associationId) {
        Long tenantId = TenantContext.get(); // Always get from context, never from request
        List<Banking> accounts = (associationId != null)
            ? bankingRepository.findByTenantIdAndAssociationId(tenantId, associationId)
            : bankingRepository.findByTenantId(tenantId);
        return accounts.stream().map(this::mapToResponse).toList();
    }

    private Banking findOwnedBanking(Long id) {
        return bankingRepository.findByIdAndTenantId(id, TenantContext.get())
                .orElseThrow(() -> BankingExceptions.notFound(id));
    }
}
```

### Repository pattern — avoid IS NULL OR in JPQL
`IS NULL OR` in JPQL causes PostgreSQL to throw `"could not determine data type of parameter $1"` when
null params are passed. Use `JpaSpecificationExecutor` (as `LedgerRepository` does) or `COALESCE` for
date params, or split into conditional service-level dispatch for Long/enum params.

```java
// SAFE for dates:
AND b.issueDate >= COALESCE(:from, b.issueDate)
AND b.issueDate <= COALESCE(:to, b.issueDate)

// UNSAFE for Long/enum — causes PostgreSQL type error when null:
AND (:associationId IS NULL OR j.associationId = :associationId)
// FIX: use JpaSpecificationExecutor or conditional dispatch in service
```

`JournalRepository.findFiltered()` currently uses the unsafe pattern for all three params.
`LedgerRepository.sumCreditByAccountType()` and `sumDebitByAccountType()` use it for associationId, from, to.

### DTO pattern — use Java records
```java
public record BankAccountRequest(
    @NotNull(message = "Association is required") Long associationId,
    @NotBlank(message = "Bank account name is required") String bankAccountName,
    @NotNull(message = "Account type is required") BankAccountType accountType,
    String country,
    @NotBlank(message = "Routing number is required") String routingNumber,
    @NotBlank(message = "Account number is required") String accountNumber,
    String accountNotes,
    Boolean checkPrintingEnabled,
    @PositiveOrZero BigDecimal balance
) {}
```

### DB Migration naming
Latest migrations: **V25** (`V25__create_bill_attachments.sql`)
Pattern: `V{N}__{description}.sql` — double underscore, snake_case description.

Accounting migrations applied:
- V19 — `create_chart_of_accounts`
- V20 — `create_journal_tables`
- V21 — `create_ledger`
- V22 — `create_bank_accounts`
- V23 — `create_bills_table`
- V24 — `create_bill_line_items_table`
- V25 — `create_bill_attachments`

---

## 7. Frontend Code Patterns

### HTTP client — always use `httpClient`, never raw axios
```js
import httpClient from "@/api/httpClient"; // preferred alias
import httpClient from "../../api/httpClient"; // relative path also works
```

### API module pattern — one file per domain, at module root
```js
// src/modules/accounting/api/accountingApi.js
// NOTE: this project places accountingApi.js in an api/ subfolder
// Import path from components: ../api/accountingApi
// Import path from accountingApi.js itself: ../../../api/httpClient (3 levels up)
```

**Import path rule for accountingApi.js:**
The file lives at `modules/accounting/api/accountingApi.js`.
From there to `src/api/httpClient.js` = `../../../api/httpClient` (3 levels up).
Components in `modules/accounting/components/` import it as `../api/accountingApi`.
Components in `modules/accounting/pages/` import it as `../api/accountingApi`.

### Routing pattern
```jsx
// routes.jsx — the CORRECT structure for accounting
export const accountingRoutes = (
  <>
    {/* Tab shell — nested routes render inside via Outlet */}
    <Route path="accounting" element={<AccountingPage />}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview"       element={<OverviewTab />} />
      <Route path="general-ledger" element={<GeneralLedgerTab />} />
      <Route path="banking"        element={<BankingTab />} />
      <Route path="bills"          element={<BillsTab />} />
      <Route path="reports"        element={<ReportsTab />} />
    </Route>

    {/* Full-page routes — OUTSIDE the tab shell, no Outlet */}
    <Route path="accounting/chart-of-accounts"          element={<ChartOfAccountsPage />} />
    <Route path="accounting/chart-of-accounts/create"   element={<AddAccountPage />} />
    <Route path="accounting/chart-of-accounts/edit/:id" element={<AddAccountPage />} />
    <Route path="accounting/journal-entry/create"       element={<RecordJournalEntryPage />} />
    <Route path="accounting/banking/create"             element={<AddBankingPage />} />
    <Route path="accounting/banking/edit/:id"           element={<AddBankingPage />} />
    <Route path="accounting/banking/details/:id"        element={<BankingDetailsPage />} />
    <Route path="accounting/banking/record/:id"         element={<RecordTransactionPage />} />
    <Route path="accounting/bills/create"               element={<CreateBillPage />} />
    <Route path="accounting/bills/edit/:id"             element={<CreateBillPage />} />
    <Route path="accounting/bills/view/:id"             element={<ViewBillPage />} />
  </>
);
```

**Current routes.jsx bug:** Has a duplicate `<Route index>` and orphan `balance-sheet` route inside
the accounting tab shell. It also has a standalone `accounting/general-ledger` route outside the
shell that renders GeneralLedgerTab without tab headers.

### localStorage keys in use
```js
localStorage.getItem("accessToken") // JWT access token
localStorage.getItem("role")        // "PLATFORM_ADMIN" or "TENANT_ADMIN"
localStorage.getItem("tenantId")    // Long as string
localStorage.getItem("associationId") // Currently selected association
```

**`tenantId` must NEVER be sent in API request bodies or params.** Server resolves it from JWT.

### UI components — shared library in `src/components/ui/`
- `Button.jsx` — variants: `primary`, `secondary`, `outline`, `danger`, `success`; sizes: `sm`, `md`, `lg`
- `Input.jsx` — label, error, helperText, leftIcon, rightIcon props
- `Select.jsx` — label, options array `[{ value, label }]`, error props
- `Card.jsx` — simple wrapper
- `StatCard.jsx` — label + value display (used in OverviewTab)

### Toast notifications — always use react-toastify
```js
import { toast } from "react-toastify";
toast.success("Bill paid successfully");
toast.error("Payment failed");
```

### CSS variables
```css
--color-primary         /* dark navy blue */
--color-primary-light
--color-primary-hover
--color-danger          /* red */
--color-danger-hover
```
Table headers consistently use `style={{ backgroundColor: "#a9c3f7" }}`.

---

## 8. Module Status Map

### ✅ Fully Complete
| Module | Notes |
|---|---|
| Platform Auth | Login, register, JWT, refresh, logout |
| Tenant Management | PLATFORM_ADMIN CRUD for tenants + subscriptions |
| Multi-tenancy | TenantFilter + TenantContext + BaseEntity |
| Associations | CRUD — associations, units, owners, board members |
| Ownership Accounts | Owner account management |
| Vendors | Full CRUD (VendorController, VendorService, VendorResponse DTO) |
| Communication — Email | Full lifecycle: draft/schedule/send/resend/reschedule/delete |
| Communication — SMS | Create/send/resend/reschedule/delete |
| Communication — Mailing | Create/edit/delete, PDF generation, recipient detail list |
| Communication — Templates | CRUD, `{{variable}}` template engine, resolve endpoint |

### ✅ Implemented (critical bugs to fix — see Section 11)
| Module | Implemented | Outstanding Bugs |
|---|---|---|
| Accounting — CoA | Full CRUD, soft delete, pagination, search | `@Builder` must be `@SuperBuilder` on `Coa.java` |
| Accounting — Journal | Create + list, balance validation, cascade ledger | `JournalRepository.findFiltered` uses unsafe IS NULL OR |
| Accounting — Ledger | JpaSpecificationExecutor, N+1 batch CoA lookup | `sumCreditByAccountType` / `sumDebitByAccountType` use IS NULL OR |
| Accounting — Banking | Full CRUD, masking, balance update | None critical |
| Accounting — Overview | Wired to LedgerRepository; returns real revenue/expenses | `outstanding` field still hardcoded to zero (BillRepository not wired) |
| Accounting — Bills | Full CRUD + pay + attachments + scheduler | `/summary` route declared after `/{id}` — 500 on GET; `BillService.pay()` uses arbitrary first LIABILITIES/ASSETS CoA |
| Accounting — Frontend | Full UI: CoA, Ledger, Banking, Bills, Journal Entry, Record Transaction | `OverviewTab` reads `res.data` not `res.data.data`; `routes.jsx` has duplicate index + orphan balance-sheet; 3 console.logs in GeneralLedgerTab; CreateBillPage generates random bill number; CreateBillPage payload missing bankAccountId field |

### 📋 Not Yet Started
| Module | Status |
|---|---|
| Accounting — Reports | Backend and frontend stubs only |
| Settings | Account, Users, Roles, Billing tabs |
| Help | Support tickets, feature suggestions |

---

## 9. Communication Module — Key Architecture

```
EmailService / SmsService / MailingService
    → RecipientResolverImpl (resolves recipients from DB)
    → DeliveryGenerator (creates Delivery records)
    → CommunicationPublisher → Kafka topic "communication.send"

CommunicationWorker (Kafka consumer)
    → sets TenantContext.set(message.getTenantId()) before processing
    → ProviderRouter
        → MailjetEmailProvider (email)
        → TwilioSmsProvider (SMS)
        → MailingProvider (physical mail)
    → Retry → "communication.retry" (up to 3 retries)
    → DLQ → "communication.dlq"
    → TenantContext.clear() in finally block
```

### Key entities
- `Message` — extends BaseEntity; type (EMAIL/SMS/MAILING); status (DRAFT/SCHEDULED/SENT/DELIVERED)
- `Delivery` — one row per recipient per message; channel/status/retryCount/errorMessage
- `MailingRecipient` — links message to specific owner IDs for physical mailing
- `CommunicationTemplate` — extends BaseEntity; level (ASSOCIATION/INDIVIDUAL/VENDOR)

### Template variable resolution — two-phase
1. **Compose-time (frontend):** Calls `POST /api/v1/communications/templates/resolve` with `associationName` + `date` → resolves `{{associationName}}`, `{{date}}`
2. **Send-time per-recipient (backend):** `VariableResolver` interface implementations resolve `{{ownerName}}`, `{{unitNumber}}`, `{{amount}}`, `{{dueDate}}` per recipient

### Known communication routes bug
`communication/routes.jsx` has three mailing routes using `/dashboard/:tenantId/communication/mailings/...`
(absolute paths with non-existent `:tenantId` param). These never match. The correct paths are:
- `communication/mailings/create`
- `communication/mailings/edit/:id`

---

## 10. Accounting Module — Key Architecture

### DB Tables (all applied via Flyway V19–V25)
```
chart_of_accounts (V19)   — accountCode, accountName, accountType, notes, is_deleted
journal_entries (V20)     — tenantId, associationId, date, memo, attachmentPath
journal_lines (V20)       — journalId, accountId, description, debit, credit
ledger_entries (V21)      — tenantId, journalId, accountId, associationId, date, debit, credit, accounting_basis
bank_accounts (V22)       — tenantId, associationId, bankAccountName, accountType, routingNumber, accountNumberMasked, balance
bills (V23)               — tenantId, billNumber, vendorId, associationId, issueDate, dueDate, status, totalAmount, paidFromBankAccountId
bill_line_items (V24)     — billId, description, expenseAccountId, amount
bill_attachments (V25)    — tenantId, billId, originalFilename, storedPath, contentType, fileSize
```

### AccountType enum (CoA)
`ASSETS`, `LIABILITIES`, `EQUITY`, `INCOME`, `EXPENSES`

### BillStatus enum
`UNPAID`, `PAID`, `OVERDUE`

### Double-entry rule
`sum(debit lines) MUST equal sum(credit lines)` on every journal entry. Validated in both:
- Frontend: live balance indicator in `RecordJournalEntryPage`
- Backend: `JournalService.validateBalanced()` throws HTTP 400 if unbalanced

### Bill creation requires bankAccountId
`CreateBillRequest` includes `bankAccountId` as a required field. The bank account is stored
on the bill at creation time (`paidFromBankAccountId`), not at payment time. This is the pre-selected
bank account for eventual payment.
**Frontend `CreateBillPage` currently does NOT include `bankAccountId` in the submit payload — this is a critical bug.**

### Bill pay auto-journal entry
`BillService.pay()` auto-creates a balanced journal entry:
```
DEBIT  first LIABILITIES account (Accounts Payable)  = bill.totalAmount
CREDIT first ASSETS account (Cash)                   = bill.totalAmount
```
**Known issue:** Uses `findFirst` for both CoA accounts — picks arbitrarily if multiple exist.
The `PayBillRequest` should include explicit CoA account IDs for proper accounting.

### Overview outstanding field
`AccountingOverviewService.getOverview()` currently returns `outstanding = BigDecimal.ZERO` as a
TODO placeholder. It should use `BillRepository.getBillSummary(tenantId, null).unpaidAmount()`
plus `overdueAmount()` once the bills module is stable.

### API endpoints (all implemented)
```
GET/POST/PUT/DELETE /api/v1/accounting/coa
GET                 /api/v1/accounting/overview?associationId=&from=&to=
GET                 /api/v1/accounting/ledger?associationId=&accountId=&from=&to=&basis=
POST                /api/v1/accounting/journal-entries
GET                 /api/v1/accounting/journal-entries?associationId=&from=&to=
GET/POST/PUT/DELETE /api/v1/accounting/banking
PATCH               /api/v1/accounting/banking/{id}/balance
GET/POST/PUT/DELETE /api/v1/accounting/bills
GET                 /api/v1/accounting/bills/summary          ← MUST be before /{id} in controller
POST                /api/v1/accounting/bills/{id}/pay
POST/GET            /api/v1/accounting/bills/{id}/attachments
GET                 /api/v1/accounting/bills/{id}/attachments/{attachmentId}/download
GET                 /api/v1/vendors
POST/PUT/DELETE     /api/v1/vendors, /api/v1/vendors/{id}
```

---

## 11. Known Critical Bugs (as of latest code review — fix before merge)

### ACCOUNTING — Backend

**1. `Coa.java` — `@Builder` instead of `@SuperBuilder`**
`Coa extends BaseEntity` which uses `@SuperBuilder`. The `@Builder` annotation on a `@SuperBuilder`
subclass generates a broken builder that does not inherit parent fields. Change to `@SuperBuilder`.

**2. `JournalRepository.findFiltered()` — unsafe IS NULL OR causes PostgreSQL 500**
All three nullable params (`associationId`, `from`, `to`) use `IS NULL OR` in JPQL. Passing null
causes PostgreSQL to throw `"could not determine data type of parameter $1"`. Every unfiltered
call to `GET /api/v1/accounting/journal-entries` will 500.
Fix: add `JpaSpecificationExecutor<Journal>` + `JournalSpecification`, or use conditional dispatch in service.

**3. `LedgerRepository.sumCreditByAccountType()` / `sumDebitByAccountType()` — same IS NULL OR risk**
Same problem. The Overview endpoint passes `associationId=null`, `from=null`, `to=null` by default.
Every load of the Overview tab will 500. Fix: drop the optional params from these queries
since Overview currently calls them with all nulls anyway.

**4. `BillController` — `/summary` declared after `/{id}` — Spring 500 on summary call**
`@GetMapping("/summary")` is at line 144; `@GetMapping("/{id}")` is at line 104.
Spring matches `GET /api/v1/accounting/bills/summary` as `/{id}` = "summary", tries to parse
"summary" as `Long`, throws `MethodArgumentTypeMismatchException` (500).
Fix: move the `@GetMapping("/summary")` method above `@GetMapping("/{id}")` in the file.

**5. `AccountingOverviewService` — `outstanding` always returns zero**
`BigDecimal outstanding = BigDecimal.ZERO; // TODO M7` — Bills module is now fully implemented.
Inject `BillRepository` and replace with:
```java
BigDecimal outstanding = billRepository.getBillSummary(tenantId, null)
    .unpaidAmount().add(billRepository.getBillSummary(tenantId, null).overdueAmount());
```
Or add a dedicated `sumUnpaidAndOverdue(Long tenantId)` query to `BillRepository`.

### ACCOUNTING — Frontend

**6. `OverviewTab.jsx` — `setStats(res.data)` — stats always undefined**
`AccountingOverviewController` wraps in `ApiResponse`. Data is at `res.data.data`.
`setStats(res.data)` sets stats to the wrapper object `{ success: true, data: {...} }`.
So `stats?.totalRevenue` is always `undefined` → all 4 cards show $0.
Fix: `setStats(res.data.data)`.

**7. `routes.jsx` — duplicate `<Route index>` and orphan `balance-sheet` inside tab shell**
The tab shell `<Route path="accounting">` has two `<Route index>` children and an orphan
`<Route path="balance-sheet">` that is not a real tab. Also has a duplicate standalone
`<Route path="accounting/general-ledger">` outside the shell (renders without tab headers).
Fix: use the clean routes structure in Section 7 above.

**8. `CreateBillPage.jsx` — payload missing `bankAccountId`; random bill number generated client-side**
The submit payload does not include `bankAccountId`, but `CreateBillRequest` requires it.
The create call will return HTTP 400 validation error every time.
Also, `billNumber` is set to a random 6-digit number client-side (`BILL-847291`) instead of
leaving it blank for the backend to auto-generate the correct sequential `BILL-001` pattern.
Fix: add a bank account dropdown to the form and include `bankAccountId` in the payload;
clear the `billNumber` field (backend generates it).

**9. `GeneralLedgerTab.jsx` — 3 debug `console.log` statements in production**
Lines with `console.log("Range for...")`, `console.log("API RESPONSE:")`, `console.log("Current Ledger Data:")`,
`console.log("Current Grouped Data:")` must be removed before merge.

### COMMUNICATION — Frontend

**10. `communication/routes.jsx` — mailing create/edit routes use wrong absolute path**
Three routes use `/dashboard/:tenantId/communication/mailings/...` (absolute paths with a
`:tenantId` param that doesn't exist in the app's URL structure). These routes will never match.
Fix:
```jsx
// Remove these three broken routes:
<Route path="/dashboard/:tenantId/communication/mailings" .../>
<Route path="/dashboard/:tenantId/communication/mailings/create" .../>
<Route path="/dashboard/:tenantId/communication/mailings/edit/:id" .../>

// Add the correct relative routes:
<Route path="communication/mailings/create" element={<CreateMailingPage />} />
<Route path="communication/mailings/edit/:id" element={<CreateMailingPage />} />
```

### ASSOCIATIONS — Backend

**11. `VendorController` GET list returns raw `Vendor` entity, not `VendorResponse` DTO**
`getActiveVendorsForTenant()` returns `ResponseEntity<List<Vendor>>` — the raw JPA entity.
The CRUD methods below it correctly use `VendorResponse`. The GET list should also use it.
Fix: change return type to `ResponseEntity<List<VendorResponse>>` and call `vendorService`
instead of `vendorRepository` directly.

---

## 12. File Structure Reference

### Backend package root
`com.gstech.saas`

```
platform/
  common/         BaseEntity, ApiResponse, HeaderConstant, ApplicationContextProvider
  security/       SecurityConfig, JwtFilter, JwtTokenProvider, Role
  exception/      GlobalExceptionHandler, CoaExceptions, BankingExceptions, BillAttachmentExceptions,
                  AssociationExceptions, OwnerExceptions, UnitExceptions
  tenant/         TenantFilter, TenantContext, TenantResolver, TenantController, TenantService
  user/           UserController, UserService, User, LoginRequest/Response, RegisterRequest
  subscription/   SubscriptionController, SubscriptionService, Subscription
  audit/          AuditService, AuditEntity, AuditListener

associations/
  association/    Association, AssociationController, AssociationService, AssociationRepository
  owner/          Owner, UnitOwner, OwnerController, OwnerService, OwnerRepository, UnitOwnerRepository
  unit/           Unit, UnitController, UnitService, UnitRepository
  vendor/         Vendor, VendorController, VendorService (VendorServiceImpl), VendorRepository,
                  VendorRequest, VendorResponse, VendorStatus

communication/
  model/          Message, Delivery, MailingRecipient, CommunicationTemplate
  controller/     EmailController, SmsController, MailingController, TemplateController, CommunicationController
  service/        EmailServiceImpl, SmsServiceImpl, MailingServiceImpl, TemplateServiceImpl,
                  MessageScheduler, OwnerLookupServiceImpl, RecipientOptionsService, DeliveryGenerator
  resolver/       RecipientResolverImpl, OwnerVariableResolver, AccountingVariableResolver, VariableResolver
  provider/       MailjetEmailProvider, TwilioSmsProvider, MailingProvider, ProviderRouter
  queue/          CommunicationPublisher, RetryPublisher, DlqPublisher
  worker/         CommunicationWorker (sets TenantContext before processing Kafka events)
  engine/         TemplateEngine ({{variable}} substitution)

accounting/
  coa/            Coa (@Builder ← should be @SuperBuilder), CoaController, CoaServiceImpl,
                  CoaRepository, CoaRequest, CoaResponse, AccountType enum
  journal/        Journal (@SuperBuilder), JournalLine, JournalController, JournalService,
                  JournalRepository (IS NULL OR bug), CreateJournalRequest, JournalResponse
  ledger/         Ledger (@SuperBuilder), LedgerController, LedgerServiceImpl, LedgerRepository
                  (JpaSpecificationExecutor + IS NULL OR in aggregate queries), LedgerSpecification,
                  LedgerFilter, LedgerEntryResponse, AccountingBasis enum
  banking/        Banking (@SuperBuilder), BankingController, BankingServiceImpl, BankingRepository,
                  BankAccountRequest, BankAccountResponse, BankAccountType enum, BalanceUpdateRequest
  bills/          Bill, BillLineItem, BillAttachment, BillStatus enum,
                  BillController (/summary AFTER /{id} — bug), BillService, BillScheduler,
                  BillAttachmentService, BillRepository, StorageService (Local + S3 implementations),
                  CreateBillRequest, BillResponse (includes bankAccountId + bankAccountName + lineItems),
                  BillSummaryResponse, PayBillRequest, BillLineItemRequest, BillLineItemResponse
  overview/       AccountingOverviewController, AccountingOverviewService (outstanding = ZERO bug),
                  AccountingOverviewResponse
  reports/        ReportsController (stub), ReportsService (stub), Reports model (stub)
  budget/         BudgetController (stub), BudgetService (stub), BudgetRepository (stub)
```

### Frontend module root
`src/`

```
api/
  httpClient.js               Axios instance with auto-auth and refresh

components/ui/
  Button.jsx, Input.jsx, Select.jsx, Card.jsx, StatCard.jsx

modules/
  associations/               Full CRUD pages, associationApi.js, unitApi.js, routes.jsx
  communication/              Email/SMS/Mailing/Template pages + modals
    emailApi.js, mailingApi.js, templateApi.js, textmsgApi.js, recipientsApi.js
    routes.jsx (has broken /dashboard/:tenantId mailing routes — see bug #10)
  ownership/                  Ownership account pages, ownershipApi.js
  accounting/
    api/
      accountingApi.js        All accounting HTTP calls (in api/ subfolder — import as ../api/accountingApi)
    components/
      OverviewTab.jsx         (setStats(res.data) bug — should be res.data.data)
      GeneralLedgerTab.jsx    (console.logs to remove; correct ledger unwrap uses res.data.content)
      BankingTab.jsx          (correct res.data.data unwrap for banking list)
      BillsTab.jsx            (correct Page unwrap via .content for bills; handlePay uses bill.bankAccountId)
      DeleteConfirmModal.jsx
    pages/
      AccountingPage.jsx, AddAccountPage.jsx, AddBankingPage.jsx (accountNotes field correct)
      BankingDetailsPage.jsx, ChartOfAccountsPage.jsx
      CreateBillPage.jsx      (missing bankAccountId in payload; random bill number bug)
      RecordJournalEntryPage.jsx, RecordTransactionPage.jsx
      ViewBillPage.jsx        (uses res.data?.data || res.data for BillController which has no ApiResponse)
    routes.jsx                (duplicate index + orphan balance-sheet + duplicate general-ledger route)

platform/
  auth/                       LoginPage, SignUpPage, authService
  dashboard/                  Dashboard layout shell with Outlet
  layout/                     Sidebar, Header, MainLayout
  routing/                    ProtectedRoute
  settings/                   Settings placeholder
  tenant/                     Tenant management (PLATFORM_ADMIN only)
```

---

## 13. Rules Every AI Tool Must Follow

### Backend rules
1. **Every entity extends `BaseEntity`** — no exceptions. Missing this causes tenant data leakage.
2. **Use `@SuperBuilder`** on entities extending `BaseEntity`, never `@Builder` alone.
3. **Never manually set `tenantId`** in service code — `@PrePersist` handles it automatically via `TenantContext`.
4. **Always scope queries by `TenantContext.get()`** — never return data without tenant filter.
5. **Use `findByIdAndTenantId(id, tenantId)`** for single-record fetches — prevents cross-tenant access.
6. **All controllers wrap in `ApiResponse.success()`** — never return raw objects. Exception: `CoaController` (returns `Page` directly), `LedgerController` (returns `Page` directly), `BillController` (returns raw types), `VendorController` GET list (returns `List<Vendor>`).
7. **Use Java records for DTOs** — not `@Data` classes.
8. **Avoid IS NULL OR in JPQL with nullable Long/enum params** — use `JpaSpecificationExecutor` or conditional service-level dispatch instead.
9. **`/summary` endpoints must be declared before `/{id}`** in the controller file to avoid Spring routing conflicts.
10. **Flyway migrations are sequential** — check the latest V-number (currently V25) before creating a new file.

### Frontend rules
1. **Always use `httpClient`** from `src/api/httpClient.js`.
2. **API response payload depends on the controller** — check the table in Section 4 before writing any unwrap:
    - `ApiResponse<T>` controllers → `res.data.data`
    - `Page<T>` direct (CoA, Ledger, Bills list) → `res.data.content`
    - Raw type direct (Bills single, Bills summary, Vendors list) → `res.data`
3. **Never send `tenantId` in request bodies or params** — server resolves it from JWT.
4. **Use `react-toastify`** for all user feedback.
5. **Enum values sent to backend must match exactly**: `"ASSETS"`, `"LIABILITIES"`, `"EQUITY"`, `"INCOME"`, `"EXPENSES"`, `"UNPAID"`, `"PAID"`, `"OVERDUE"`, `"CHECKING"`, `"SAVINGS"`, `"MONEY_MARKET"`, `"CASH"`, `"ACCRUAL"`.
6. **Tab pages use nested routes with `Outlet`** — full-page forms are sibling routes outside the tab shell.
7. **Bill number should NOT be generated on the frontend** — leave blank, backend generates `BILL-001` sequentially.
8. **`CreateBillRequest` requires `bankAccountId`** — the form must include a bank account dropdown and pass it in the payload.

### PR Review checklist
- `setStats(res.data)` instead of `setStats(res.data.data)` → bug (for ApiResponse-wrapped controllers)
- `import httpClient from "../../../api/httpClient"` in `accountingApi.js` → correct (3 levels from api/ subfolder)
- `import httpClient from "../../api/httpClient"` in `accountingApi.js` → wrong path (2 levels)
- Bills list uses `res.data?.content` → correct (BillController returns `Page` directly)
- Bills summary uses `res.data` → correct (BillController returns `BillSummaryResponse` directly)
- Overview stats use `res.data.data` → correct (AccountingOverviewController wraps in ApiResponse)
- `IS NULL OR` in JPQL for nullable Long/enum params → will 500 on PostgreSQL
- `@Builder` on subclass of `@SuperBuilder` → Lombok conflict, use `@SuperBuilder`
- Bill create payload missing `bankAccountId` → validation 400 from backend
- Random bill number generated client-side → overwrites server sequential BILL-001 numbering
- `/summary` mapped after `/{id}` in controller → Spring parses "summary" as Long → 500
- Mailing routes with `/dashboard/:tenantId/` prefix → never match, unreachable

---

## 14. Development Environment

### Running locally
```bash
# Backend (port 8080)
cd backend && mvn spring-boot:run

# Frontend (port 5173)
cd frontend && npm run dev

# Database
docker-compose up postgres

# Kafka (required for communication module)
docker-compose up zookeeper kafka
```

### Environment variables
```
VITE_API_BASE_URL=http://localhost:8080   # frontend .env
POSTGRES_DB=societydb
POSTGRES_USER=societydb
POSTGRES_PASSWORD=Societydb@123
SPRING_PORT=8080
REACT_PORT=80
```

### Swagger UI
`http://localhost:8080/swagger-ui.html`

---

## 15. Milestone Roadmap

| Milestone | Scope | Status |
|---|---|---|
| M1–M4 | Platform auth, tenants, associations, owners, communication | ✅ Done |
| M5 | Chart of Accounts, Overview stats | ✅ Done |
| M6 | General Ledger (journal entries + ledger), Banking | ✅ Done |
| M7 | Bills (create/pay/attachments/scheduler), Reports (stubs) | ✅ Bills done; Reports = stubs only |
| Reports | Balance Sheet, Income Statement backend + frontend | 📋 Next |
| Settings | Account, Users, Roles, Billing tabs | 📋 Planned |
| Help | Support ticket form, Feature suggestion form | 📋 Planned |