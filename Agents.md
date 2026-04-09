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

**Rule:** Any entity extending `BaseEntity` must use `@SuperBuilder` (not `@Builder`) because `@Builder` does not inherit from the superclass builder chain.

### Fetching in services — always scope by tenantId
```java
// CORRECT
repository.findByTenantId(TenantContext.get());

// WRONG — returns data from all tenants
repository.findAll();
```

---

## 4. API Response Contract (Critical — all responses use this wrapper)

Every API endpoint returns `ApiResponse<T>`:
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

**On the frontend**, the actual payload is always at `res.data.data` (not `res.data`):
```js
const res = await httpClient.get("/api/v1/accounting/coa");
const accounts = res.data.data; // ApiResponse wrapper → unwrap .data
```

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

**Note:** `MANAGER` and `VIEWER` roles are planned (Settings module) but not yet in the `Role` enum.

### JWT Claims
Token contains: `tenantId`, `role`, `userId`, `sub` (email)

`userId` is injected as a request attribute `x-user-id` by `JwtFilter` — available in controllers via:
```java
@RequestAttribute(HeaderConstant.USER_ID_HEADER_KEY) Long userId
```

### Auth flow
- Login → short-lived access token (JSON body) + long-lived refresh token (HttpOnly cookie, path `/users/refresh`)
- Refresh → `POST /users/refresh` with cookie → new access token
- Frontend stores access token in `localStorage.accessToken` via `storage.js`

---

## 6. Backend Code Patterns

### Controller pattern (follow AssociationController exactly)
```java
@RestController
@RequestMapping("/api/v1/accounting/coa")
@RequiredArgsConstructor
@Tag(name = "Chart of Accounts", description = "CoA APIs")
public class CoaController {
    private final CoaService coaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CoaResponse>>> listAccounts(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(coaService.listAccounts(search)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CoaResponse>> create(@Valid @RequestBody CoaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(coaService.create(request)));
    }
}
```

### Service pattern
```java
@Service
@Slf4j
@RequiredArgsConstructor
public class CoaService {
    private final CoaRepository coaRepository;

    @Transactional
    public CoaResponse create(CoaRequest request) {
        Long tenantId = TenantContext.get(); // Always get from context, never from request
        // build entity using builder — BaseEntity @PrePersist sets tenantId automatically
        Coa coa = Coa.builder()
                .accountName(request.accountName())
                .build();
        return toResponse(coaRepository.save(coa));
    }

    private Coa findForTenant(Long id) {
        return coaRepository.findByIdAndTenantId(id, TenantContext.get())
                .orElseThrow(() -> new EntityNotFoundException("Not found: " + id));
    }
}
```

### Repository pattern
```java
@Repository
public interface CoaRepository extends JpaRepository<Coa, Long> {
    List<Coa> findByTenantId(Long tenantId);
    Optional<Coa> findByIdAndTenantId(Long id, Long tenantId); // always scope to tenant on single-record fetches
}
```

### DTO pattern — use Java records
```java
public record CoaRequest(
    @NotBlank(message = "Account name is required") String accountName,
    @NotNull(message = "Account type is required") AccountType accountType,
    String accountCode, // optional
    String notes        // optional
) {}

public record CoaResponse(Long id, String accountCode, String accountName,
                           AccountType accountType, String notes, Instant createdAt) {}
```

### DB Migration naming
Latest migration: **V18** (`V18__add_template_fields.sql`)
Next migrations for accounting: V19 (CoA), V20 (Journal+Ledger), V21 (Banking)
Pattern: `V{N}__{description}.sql` — double underscore, snake_case description

**Important:** `spring.flyway.enabled=false` in dev. Migrations must be applied manually or toggled on.

---

## 7. Frontend Code Patterns

### HTTP client — always use `httpClient`, never raw axios
```js
// src/api/httpClient.js
// - Reads VITE_API_BASE_URL from env
// - Auto-injects Authorization: Bearer <token> from localStorage
// - Auto-refreshes on 401 via HttpOnly cookie
import httpClient from "../../api/httpClient"; // relative path from module
import httpClient from "@/api/httpClient";      // alias path (both work)
```

### API module pattern — one file per domain
```js
// src/modules/accounting/accountingApi.js
import httpClient from "../../api/httpClient";

export const getCoaList = (search = "", type = "") =>
  httpClient.get("/api/v1/accounting/coa", {
    params: { ...(search && { search }), ...(type && { type }) },
  });

export const createAccount = (data) =>
  httpClient.post("/api/v1/accounting/coa", data);
```

**Naming:** `emailApi.js`, `mailingApi.js`, `accountingApi.js` — placed at module root, NOT in a subfolder.

### Routing pattern — module routes exported and registered in App.jsx
```jsx
// src/modules/accounting/routes.jsx
export const accountingRoutes = (
  <>
    {/* Tab layout shell — nested routes render via Outlet */}
    <Route path="accounting" element={<AccountingPage />}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview" element={<OverviewTab />} />
    </Route>
    {/* Full-page routes — no tab layout */}
    <Route path="accounting/chart-of-accounts" element={<ChartOfAccountsPage />} />
  </>
);

// App.jsx — register inside the /dashboard route:
{accountingRoutes}
```

### Tab layout pattern — follow CommunicationPage exactly
```jsx
export default function AccountingPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeTab = TABS.find((t) => pathname.includes(t.id))?.id || "overview";

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Accounting</h2>
      <div className="overflow-x-auto border-b border-gray-200 mb-6">
        <div className="flex min-w-max">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => navigate(tab.id)}
              className="px-4 sm:px-1 sm:mr-8 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
              style={activeTab === tab.id
                ? { borderColor: "var(--color-primary)", color: "var(--color-primary)" }
                : { borderColor: "transparent", color: "#6b7280" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <Outlet />
    </div>
  );
}
```

### localStorage keys in use
```js
localStorage.getItem("accessToken") // JWT access token (set by login)
localStorage.getItem("role")        // "PLATFORM_ADMIN" or "TENANT_ADMIN"
localStorage.getItem("tenantId")    // Long as string
localStorage.getItem("associationId") // Currently selected association
```

**Important:** `tenantId` must NEVER be sent in API request bodies or params. It is resolved server-side from the JWT via `TenantContext`. The only exception is legacy routes from early development.

### UI components — shared library in `src/components/ui/`
- `Button.jsx` — variants: `primary`, `secondary`, `outline`, `danger`, `success`; sizes: `sm`, `md`, `lg`
- `Input.jsx` — label, error, helperText, leftIcon, rightIcon props
- `Select.jsx` — label, options array, error props
- `Card.jsx` — simple wrapper

### Toast notifications — always use react-toastify
```js
import { toast } from "react-toastify";
toast.success("Email sent");
toast.error("Failed to load");
// ToastContainer is in App.jsx — position bottom-right, autoClose 3000ms
```

### CSS variables (defined globally)
```css
--color-primary         /* dark navy blue */
--color-primary-light
--color-primary-hover
--color-danger          /* red for delete/errors */
--color-danger-hover
```
Table headers use `style={{ backgroundColor: "#a9c3f7" }}` consistently.

---

## 8. Module Status Map

### ✅ Complete
| Module | Description |
|---|---|
| Platform Auth | Login, register, JWT, refresh token rotation, logout |
| Tenant Management | PLATFORM_ADMIN CRUD for tenants + subscriptions |
| Multi-tenancy | TenantFilter + TenantContext + BaseEntity |
| Associations | Full CRUD — associations, units, owners, board members |
| Ownership Accounts | Owner account management |
| Vendors | Vendor CRUD (model exists, no controller yet) |

### ✅ Complete (mostly — some bugs noted)
| Module | Status Notes |
|---|---|
| Communication — Email | Create/Draft/Schedule/Send/Resend/Reschedule/Delete. Kafka dispatch works. |
| Communication — SMS | Create/Send/Resend/Reschedule/Delete. Phone numbers depend on owner phone being in DB. |
| Communication — Mailing | Create/Edit/Delete. PDF generation implemented. Recipient detail list in MailingDetailDto. |
| Communication — Templates | Full CRUD, template engine ({{variable}} substitution), resolve endpoint. |

### 🔄 In Progress (Milestone 5)
| Module | Status |
|---|---|
| Accounting — Overview tab | Backend stub → being implemented |
| Accounting — Chart of Accounts | Backend stub → being implemented. V19 migration needed. |
| Accounting routing + AccountingPage | PRs in review (PR #123, PR #137) |

### 📋 Planned (Milestone 6)
- General Ledger (journal entries + ledger view)
- Banking (bank account registration)

### 📋 Planned (Milestone 7)
- Bills (create/pay/track vendor bills)
- Reports (Balance Sheet, Income Statement)

### 📋 Planned (Settings & Help)
- Settings: Account tab (extend Tenant entity), Users tab, Roles tab, Billing tab
- Help: Support ticket + feature suggestion forms

---

## 9. Communication Module — Key Architecture

```
EmailService/SmsService/MailingService
    → RecipientResolverImpl (resolves recipients from DB)
    → DeliveryGenerator (creates Delivery records)
    → CommunicationPublisher → Kafka topic "communication.send"

CommunicationWorker (Kafka consumer)
    → ProviderRouter
        → MailjetEmailProvider (email)
        → TwilioSmsProvider (SMS)
        → MailingProvider (physical mail)
    → Retry → "communication.retry"
    → DLQ → "communication.dlq"
```

### Key entities
- `Message` — extends BaseEntity, has type (EMAIL/SMS/MAILING), status (DRAFT/SCHEDULED/SENT/DELIVERED), recipientLabel (String)
- `Delivery` — one row per recipient per message, has email/phone/channel/status/retryCount
- `MailingRecipient` — links message to specific owner IDs for mailing
- `CommunicationTemplate` — extends BaseEntity, has level (ASSOCIATION/INDIVIDUAL/VENDOR)

### RecipientType enum
`ALL_OWNERS`, `ALL_RESIDENTS`, `BOARD_MEMBERS`, `OWNER` (specific selection)

### Channel enum
`EMAIL`, `SMS`, `MAILING`

### MessageStatus enum
`DRAFT`, `SCHEDULED`, `SENT`, `DELIVERED`

### Important: scheduledAt field
Only include `scheduledAt` in the payload when status is `SCHEDULED` and both date AND time are filled. Never default it to null on non-scheduled sends — omit the field entirely.

---

## 10. Accounting Module — Key Architecture (In Progress)

### DB Tables (planned)
```
chart_of_accounts (V19)   — accountCode, accountName, accountType enum, notes
journal_entries (V20)     — date, associationId, memo
journal_lines (V20)       — journalId, accountId, description, debit, credit
ledger_entries (V20)      — journalId, accountId, associationId, date, debit, credit, accountingBasis
bank_accounts (V21)       — associationId, bankAccountName, accountType, routingNumber, accountNumberMasked, balance
```

### AccountType enum (CoA)
`ASSETS`, `LIABILITIES`, `EQUITY`, `INCOME`, `EXPENSES`

### Double-entry rule
`sum(debit lines) MUST equal sum(credit lines)` on every journal entry. Validate in both frontend (instant feedback) and backend service (authoritative). Return HTTP 400 if unbalanced.

### API endpoints (planned)
```
GET/POST/PUT/DELETE /api/v1/accounting/coa
GET                 /api/v1/accounting/overview
POST                /api/v1/accounting/journal-entries
GET                 /api/v1/accounting/ledger?associationId=&accountId=&from=&to=&basis=
GET/POST/PUT/DELETE /api/v1/accounting/banking
GET                 /api/v1/accounting/reports/balance-sheet
GET                 /api/v1/accounting/reports/income-statement
```

---

## 11. Known Issues & Bugs (as of latest codebase review)

### Backend
- `spring.flyway.enabled=false` — Flyway is disabled. All migrations must be run manually or this flag toggled for new tables to be created.
- All accounting service/repository/controller classes are **empty stubs** — Milestone 5/6/7 work.
- `UserController` has no list/invite/deactivate endpoints — Settings module work.
- `Tenant` entity missing address, phone, email, accountOwner fields — Settings module work.
- `Subscription` entity missing planName, nextBillingDate, unitsUsed — Settings module work.
- `Role` enum only has PLATFORM_ADMIN and TENANT_ADMIN — MANAGER and VIEWER not yet added.

### Frontend
- `Sidebar.jsx` does not yet have Accounting nav link — needs adding when accounting routes are stable.
- `src/accounting/coa/` (empty legacy folder) — ignore, replaced by `src/modules/accounting/`.
- Some communication pages still pass `tenantId` to API calls where it should be omitted.

---

## 12. File Structure Reference

### Backend package root
`com.gstech.saas`

```
platform/
  common/         BaseEntity, ApiResponse, HeaderConstant
  security/       SecurityConfig, JwtFilter, JwtTokenProvider, Role
  tenant/         TenantFilter, TenantContext, TenantResolver, TenantController, TenantService
  user/           UserController, UserService, User, LoginRequest/Response, RegisterRequest
  subscription/   SubscriptionController, SubscriptionService, Subscription
  audit/          AuditService, AuditEntity

associations/
  association/    Association, AssociationController, AssociationService, AssociationRepository
  owner/          UnitOwner, Owner (via UnitOwner join)
  unit/           Unit
  vendor/         Vendor (model only, no controller)

communication/
  model/          Message, Delivery, MailingRecipient, CommunicationTemplate
  controller/     EmailController, SmsController, MailingController, TemplateController, CommunicationController
  service/        EmailServiceImpl, SmsServiceImpl, MailingServiceImpl, TemplateServiceImpl, MessageScheduler
  resolver/       RecipientResolverImpl
  provider/       MailjetEmailProvider, TwilioSmsProvider, MailingProvider, ProviderRouter
  queue/          CommunicationPublisher, RetryPublisher, DlqPublisher
  worker/         CommunicationWorker
  dto/            Channel, MessageStatus, RecipientType, CreateMessageRequest, etc.

accounting/       (all stubs — being implemented)
  coa/            Coa, CoaController, CoaService, CoaRepository
  journal/        Journal, JournalController, JournalService, JournalRepository
  ledger/         Ledger, LedgerController, LedgerService, LedgerRepository
  banking/        Banking, BankingController, BankingService, BankingRepository
  bills/          Bill, BillController, BillService, BillRepository
  reports/        ReportsController, ReportsService
```

### Frontend module root
`src/`

```
api/
  httpClient.js               Axios instance — use this everywhere

components/ui/
  Button.jsx, Input.jsx, Select.jsx, Card.jsx

modules/
  associations/               Full CRUD pages, associationApi.js, unitApi.js
  communication/              Email/SMS/Mailing/Template pages + modals + API files
  ownership/                  Ownership account pages, ownershipApi.js
  accounting/                 (in progress)
    accountingApi.js          All accounting HTTP calls
    routes.jsx                Accounting routes
    pages/                    AccountingPage, OverviewTab, ChartOfAccountsPage, AddAccountPage, ...
    components/               Tab placeholders (BankingTab, BillsTab, etc.)

platform/
  auth/                       LoginPage, SignUpPage, authService
  dashboard/                  Dashboard (layout shell with Outlet)
  layout/                     Sidebar, Header, MainLayout
  routing/                    ProtectedRoute
  settings/                   Settings placeholder
  tenant/                     Tenant management (PLATFORM_ADMIN only)

shared/
  components/                 ErrorMessage, Loader, Modal, Table
  utils/storage.js            localStorage helpers (setToken, getAccessToken, clearStorage)
```

---

## 13. Rules Every AI Tool Must Follow

### Backend rules
1. **Every entity extends `BaseEntity`** — no exceptions. Missing this causes tenant data leakage.
2. **Use `@SuperBuilder`** on entities, never `@Builder` alone — BaseEntity uses SuperBuilder.
3. **Never manually set `tenantId`** in service code — `@PrePersist` handles it automatically.
4. **Always scope queries by `TenantContext.get()`** — never return data without tenant filter.
5. **Use `findByIdAndTenantId(id, tenantId)`** for single-record fetches — prevents cross-tenant access.
6. **All controllers return `ApiResponse.success()`** wrapper — never return raw objects.
7. **Use Java records for DTOs** — not `@Data` classes. Follow the `CoaRequest`/`CoaResponse` record pattern.
8. **Business logic in service layer, not controllers** — controllers only map HTTP → service calls.
9. **Flyway migrations are sequential** — check the latest V-number before creating a new migration file.
10. **`spring.jpa.hibernate.ddl-auto=update`** is set — but Flyway is preferred for production migrations.

### Frontend rules
1. **Always use `httpClient`** from `src/api/httpClient.js` — never import axios directly.
2. **API response payload is at `res.data.data`** — always unwrap the `ApiResponse` wrapper.
3. **Never send `tenantId` in API request bodies or params** — server resolves it from JWT.
4. **Use `react-toastify`** for all user feedback — `toast.success()`, `toast.error()`.
5. **Import `toast` at the top of every file that uses it** — not doing so causes `ReferenceError` at runtime.
6. **API files live at module root** — `modules/accounting/accountingApi.js`, not in a subfolder.
7. **Routes are exported from `routes.jsx`** in each module and registered in `App.jsx`.
8. **Tab pages use nested routes with `Outlet`** — follow `CommunicationPage.jsx` exactly.
9. **Full-page forms (create/edit) are sibling routes outside the tab shell** — not nested inside the tab layout.
10. **Enum values sent to backend must be UPPERCASE** — e.g., `"ASSETS"` not `"Assets"`.

### PR Review rules
- A bug in `accountingApi.js` calling `/api/v1/accounting/accounts` is always wrong — CoA endpoint is `/api/v1/accounting/coa`.
- Navigation commented out with `/* */` after form submission is always a bug — the user gets stuck.
- `setFormData(res.data)` instead of `setFormData(res.data.data)` always sets the ApiResponse wrapper, not the payload.
- `stats?.revenue` is always wrong if the backend returns `totalRevenue` — field names must match the DTO record exactly.

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

# Kafka (for communication module)
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
`http://localhost:8080/swagger-ui.html` — all endpoints documented via SpringDoc OpenAPI.

---

## 15. Milestone Roadmap

| Milestone | Scope | Status |
|---|---|---|
| M1–M4 | Platform auth, tenants, associations, owners, communication | ✅ Done |
| M5 | Accounting page layout, Chart of Accounts, Overview stats | 🔄 In Progress |
| M6 | General Ledger (journal entries + ledger view), Banking | 📋 Planned |
| M7 | Bills (create/pay), Reports (Balance Sheet, P&L) | 📋 Planned |
| Settings | Account tab, Users tab, Roles tab, Billing tab | 📋 Planned |
| Help | Support ticket form, Feature suggestion form | 📋 Planned |
