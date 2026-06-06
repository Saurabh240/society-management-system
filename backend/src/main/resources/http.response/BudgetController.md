# 📦 SocietyManagement API – Budget Management

---

# 💰 Endpoint: Create Budget

### ✅ Request Details

- **Type:** POST
- **URL:** `http://localhost:8080/api/v1/accounting/budgets`

---

## 📥 Request Body

| Field | Type | Required | Default |
|-------|------|-----------|---------|
| name | String | ✅ | — |
| fiscalYear | Integer | ✅ | — |
| startDate | yyyy-MM-dd | ✅ | — |
| endDate | yyyy-MM-dd | ✅ | — |
| associationId | Long | ❌ | All Associations |
| status | DRAFT / ACTIVE / CLOSED | ❌ | DRAFT |
| notes | String | ❌ | null |
| lineItems | Array | ❌ | [] |

### Line Item Fields

| Field | Type | Required |
|-------|------|-----------|
| accountId | Long | ✅ |
| budgetedAmount | Decimal | ✅ |
| notes | String | ❌ |

---

## Example 1 — Create DRAFT Budget (No Line Items)

### Request

```http
POST /api/v1/accounting/budgets
```

```json
{
  "name": "2024 Annual Budget",
  "fiscalYear": 2024,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "associationId": 1,
  "status": "DRAFT",
  "notes": "Initial draft budget"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "associationId": 1,
    "name": "2024 Annual Budget",
    "fiscalYear": 2024,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "DRAFT",
    "notes": "Initial draft budget",
    "lineItems": []
  }
}
```

---

## Example 2 — Create DRAFT Budget With Line Items

### Request

```http
POST /api/v1/accounting/budgets
```

```json
{
  "name": "2025 Annual Budget",
  "fiscalYear": 2025,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "associationId": 1,
  "status": "DRAFT",
  "notes": "Budget with line items",
  "lineItems": [
    { "accountId": 4, "budgetedAmount": 50000.00, "notes": "HOA Fees income" },
    { "accountId": 5, "budgetedAmount": 12000.00, "notes": "Payments budget" },
    { "accountId": 1, "budgetedAmount": 8000.00,  "notes": "Assets allocation" }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 2,
    "associationId": 1,
    "name": "2025 Annual Budget",
    "fiscalYear": 2025,
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "status": "DRAFT",
    "notes": "Budget with line items",
    "lineItems": [
      {
        "id": 1,
        "accountId": 4,
        "accountCode": "103",
        "accountName": "m4",
        "budgetedAmount": 50000.00,
        "notes": "HOA Fees income"
      },
      {
        "id": 2,
        "accountId": 5,
        "accountCode": "wdk",
        "accountName": "payments",
        "budgetedAmount": 12000.00,
        "notes": "Payments budget"
      },
      {
        "id": 3,
        "accountId": 1,
        "accountCode": "1011",
        "accountName": "m",
        "budgetedAmount": 8000.00,
        "notes": "Assets allocation"
      }
    ]
  }
}
```

---

## Example 3 — Create ACTIVE Budget

### Request

```http
POST /api/v1/accounting/budgets
```

```json
{
  "name": "2026 Active Budget",
  "fiscalYear": 2026,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "associationId": 1,
  "status": "ACTIVE",
  "notes": "Board approved budget"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "associationId": 1,
    "name": "2026 Active Budget",
    "fiscalYear": 2026,
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "status": "ACTIVE",
    "notes": "Board approved budget",
    "lineItems": []
  }
}
```

---

## Example 4 — Invalid Account ID

### Request

```http
POST /api/v1/accounting/budgets
```

```json
{
  "name": "Bad Budget",
  "fiscalYear": 2025,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "lineItems": [
    { "accountId": 99999, "budgetedAmount": 1000.00 }
  ]
}
```

### Response

```json
{
  "success": false,
  "error": "Account IDs not found or deleted: [99999]"
}
```

---

## Example 5 — End Date Before Start Date

### Request

```http
POST /api/v1/accounting/budgets
```

```json
{
  "name": "Bad Date Budget",
  "fiscalYear": 2025,
  "startDate": "2025-12-31",
  "endDate": "2025-01-01"
}
```

### Response

```json
{
  "success": false,
  "error": "End date must be after start date"
}
```

---

## Example 6 — Missing Required Fields

### Request

```http
POST /api/v1/accounting/budgets
```

```json
{
  "notes": "Missing everything"
}
```

### Response

```json
{
  "success": false,
  "error": "Validation failed",
  "errorCode": "400"
}
```

---

## Example 7 — Duplicate ACTIVE Budget Same Year

### Request

```http
POST /api/v1/accounting/budgets
```

```json
{
  "name": "Duplicate Active",
  "fiscalYear": 2026,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "associationId": 1,
  "status": "ACTIVE"
}
```

### Response

```json
{
  "success": false,
  "error": "An ACTIVE budget already exists for fiscal year 2026. Close it before activating another."
}
```

---

# 📋 Endpoint: List Budgets

### ✅ Request Details

- **Type:** GET
- **URL:** `http://localhost:8080/api/v1/accounting/budgets`

---

## 📤 Query Parameters

| Parameter | Type | Required | Default |
|------------|------|-----------|---------|
| associationId | Long | ❌ | All Associations |
| fiscalYear | Integer | ❌ | All Years |

---

## Example 1 — No Filters

### Request

```http
GET /api/v1/accounting/budgets
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "associationId": 1,
      "name": "2025 Annual Budget",
      "fiscalYear": 2025,
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "status": "DRAFT",
      "notes": "Budget with line items",
      "lineItems": []
    },
    {
      "id": 1,
      "associationId": 1,
      "name": "2024 Annual Budget",
      "fiscalYear": 2024,
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "status": "DRAFT",
      "notes": "Initial draft budget",
      "lineItems": []
    }
  ]
}
```

---

## Example 2 — Filter by associationId

### Request

```http
GET /api/v1/accounting/budgets?associationId=1
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "associationId": 1,
      "name": "2025 Annual Budget",
      "fiscalYear": 2025,
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "status": "DRAFT",
      "notes": "Budget with line items",
      "lineItems": []
    },
    {
      "id": 1,
      "associationId": 1,
      "name": "2024 Annual Budget",
      "fiscalYear": 2024,
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "status": "DRAFT",
      "notes": "Initial draft budget",
      "lineItems": []
    }
  ]
}
```

---

## Example 3 — Filter by fiscalYear

### Request

```http
GET /api/v1/accounting/budgets?fiscalYear=2024
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "associationId": 1,
      "name": "2024 Annual Budget",
      "fiscalYear": 2024,
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "status": "DRAFT",
      "notes": "Initial draft budget",
      "lineItems": []
    }
  ]
}
```

---

## Example 4 — Filter by Both

### Request

```http
GET /api/v1/accounting/budgets?associationId=1&fiscalYear=2025
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "associationId": 1,
      "name": "2025 Annual Budget",
      "fiscalYear": 2025,
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "status": "DRAFT",
      "notes": "Budget with line items",
      "lineItems": []
    }
  ]
}
```

---

## Example 5 — No Data Found

### Request

```http
GET /api/v1/accounting/budgets?associationId=999
```

### Response

```json
{
  "success": true,
  "data": []
}
```

---

# 🔍 Endpoint: Get Budget by ID

### ✅ Request Details

- **Type:** GET
- **URL:** `http://localhost:8080/api/v1/accounting/budgets/{id}`

---

## Example 1 — Found

### Request

```http
GET /api/v1/accounting/budgets/1
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "associationId": 1,
    "name": "2024 Annual Budget",
    "fiscalYear": 2024,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "DRAFT",
    "notes": "Initial draft budget",
    "lineItems": []
  }
}
```

---

## Example 2 — Not Found

### Request

```http
GET /api/v1/accounting/budgets/99999
```

### Response

```json
{
  "success": false,
  "error": "Budget not found: 99999"
}
```

---

# ✏️ Endpoint: Update Budget

### ✅ Request Details

- **Type:** PUT
- **URL:** `http://localhost:8080/api/v1/accounting/budgets/{id}`

---

## 📥 Request Body

| Field | Type | Required |
|-------|------|-----------|
| name | String | ✅ |
| fiscalYear | Integer | ✅ |
| startDate | yyyy-MM-dd | ✅ |
| endDate | yyyy-MM-dd | ✅ |
| status | DRAFT / ACTIVE / CLOSED | ✅ |
| associationId | Long | ❌ |
| notes | String | ❌ |

---

## Example 1 — DRAFT to ACTIVE

### Request

```http
PUT /api/v1/accounting/budgets/1
```

```json
{
  "name": "2024 Annual Budget - Approved",
  "fiscalYear": 2024,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "associationId": 1,
  "status": "ACTIVE",
  "notes": "Board approved on Jan 1"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "associationId": 1,
    "name": "2024 Annual Budget - Approved",
    "fiscalYear": 2024,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "ACTIVE",
    "notes": "Board approved on Jan 1",
    "lineItems": []
  }
}
```

---

## Example 2 — ACTIVE to CLOSED

### Request

```http
PUT /api/v1/accounting/budgets/1
```

```json
{
  "name": "2024 Annual Budget - Closed",
  "fiscalYear": 2024,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "associationId": 1,
  "status": "CLOSED",
  "notes": "Closed at year end"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "associationId": 1,
    "name": "2024 Annual Budget - Closed",
    "fiscalYear": 2024,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "CLOSED",
    "notes": "Closed at year end",
    "lineItems": []
  }
}
```

---

## Example 3 — Update CLOSED Budget (Not Allowed)

### Request

```http
PUT /api/v1/accounting/budgets/1
```

```json
{
  "name": "Try to edit closed",
  "fiscalYear": 2024,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "status": "DRAFT"
}
```

### Response

```json
{
  "success": false,
  "error": "Cannot update a CLOSED budget"
}
```

---

## Example 4 — Not Found

### Request

```http
PUT /api/v1/accounting/budgets/99999
```

```json
{
  "name": "Ghost Budget",
  "fiscalYear": 2024,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "status": "DRAFT"
}
```

### Response

```json
{
  "success": false,
  "error": "Budget not found: 99999"
}
```

---

# 🗑️ Endpoint: Delete Budget

### ✅ Request Details

- **Type:** DELETE
- **URL:** `http://localhost:8080/api/v1/accounting/budgets/{id}`

---

## Example 1 — Delete DRAFT Budget

### Request

```http
DELETE /api/v1/accounting/budgets/2
```

### Response

```
204 No Content
```

---

## Example 2 — Delete ACTIVE Budget (Not Allowed)

### Request

```http
DELETE /api/v1/accounting/budgets/3
```

### Response

```json
{
  "success": false,
  "error": "Cannot delete an ACTIVE budget. Close it first."
}
```

---

## Example 3 — Not Found

### Request

```http
DELETE /api/v1/accounting/budgets/99999
```

### Response

```json
{
  "success": false,
  "error": "Budget not found: 99999"
}
```

---

# 📄 Endpoint: Get Line Items

### ✅ Request Details

- **Type:** GET
- **URL:** `http://localhost:8080/api/v1/accounting/budgets/{id}/line-items`

---

## Example 1 — With Line Items

### Request

```http
GET /api/v1/accounting/budgets/2/line-items
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "accountId": 4,
      "accountCode": "103",
      "accountName": "m4",
      "budgetedAmount": 50000.00,
      "notes": "HOA Fees income"
    },
    {
      "id": 2,
      "accountId": 5,
      "accountCode": "wdk",
      "accountName": "payments",
      "budgetedAmount": 12000.00,
      "notes": "Payments budget"
    },
    {
      "id": 3,
      "accountId": 1,
      "accountCode": "1011",
      "accountName": "m",
      "budgetedAmount": 8000.00,
      "notes": "Assets allocation"
    }
  ]
}
```

---

## Example 2 — Empty Line Items

### Request

```http
GET /api/v1/accounting/budgets/1/line-items
```

### Response

```json
{
  "success": true,
  "data": []
}
```

---

## Example 3 — Budget Not Found

### Request

```http
GET /api/v1/accounting/budgets/99999/line-items
```

### Response

```json
{
  "success": false,
  "error": "Budget not found: 99999"
}
```

---

# 🔄 Endpoint: Replace Line Items

### ✅ Request Details

- **Type:** PUT
- **URL:** `http://localhost:8080/api/v1/accounting/budgets/{id}/line-items`

---

## Example 1 — Replace All Line Items

### Request

```http
PUT /api/v1/accounting/budgets/2/line-items
```

```json
[
  { "accountId": 4, "budgetedAmount": 60000.00, "notes": "Updated HOA fees" },
  { "accountId": 5, "budgetedAmount": 15000.00, "notes": "Updated payments" },
  { "accountId": 2, "budgetedAmount": 5000.00,  "notes": "Liabilities reserve" },
  { "accountId": 3, "budgetedAmount": 3000.00,  "notes": "Equity allocation" }
]
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "accountId": 4,
      "accountCode": "103",
      "accountName": "m4",
      "budgetedAmount": 60000.00,
      "notes": "Updated HOA fees"
    },
    {
      "id": 5,
      "accountId": 5,
      "accountCode": "wdk",
      "accountName": "payments",
      "budgetedAmount": 15000.00,
      "notes": "Updated payments"
    },
    {
      "id": 6,
      "accountId": 2,
      "accountCode": "10011",
      "accountName": "maintenance",
      "budgetedAmount": 5000.00,
      "notes": "Liabilities reserve"
    },
    {
      "id": 7,
      "accountId": 3,
      "accountCode": "1003",
      "accountName": "m3",
      "budgetedAmount": 3000.00,
      "notes": "Equity allocation"
    }
  ]
}
```

---

## Example 2 — Clear All Line Items

### Request

```http
PUT /api/v1/accounting/budgets/2/line-items
```

```json
[]
```

### Response

```json
{
  "success": true,
  "data": []
}
```

---

## Example 3 — Replace on CLOSED Budget (Not Allowed)

### Request

```http
PUT /api/v1/accounting/budgets/1/line-items
```

```json
[
  { "accountId": 4, "budgetedAmount": 1000.00 }
]
```

### Response

```json
{
  "success": false,
  "error": "Cannot modify line items of a CLOSED budget"
}
```

---

## Example 4 — Invalid Account ID in Line Items

### Request

```http
PUT /api/v1/accounting/budgets/2/line-items
```

```json
[
  { "accountId": 99999, "budgetedAmount": 1000.00 }
]
```

### Response

```json
{
  "success": false,
  "error": "Account IDs not found or deleted: [99999]"
}
```

---

## Example 5 — Budget Not Found

### Request

```http
PUT /api/v1/accounting/budgets/99999/line-items
```

```json
[
  { "accountId": 4, "budgetedAmount": 1000.00 }
]
```

### Response

```json
{
  "success": false,
  "error": "Budget not found: 99999"
}
```

---

# 📐 Budget Status Lifecycle

```
DRAFT → ACTIVE → CLOSED
```

| Transition | Allowed | Rule |
|---|---|---|
| DRAFT → ACTIVE | ✅ | Only one ACTIVE per association per fiscal year |
| DRAFT → CLOSED | ✅ | Allowed |
| ACTIVE → CLOSED | ✅ | Allowed |
| ACTIVE → DRAFT | ✅ | Allowed |
| CLOSED → any | ❌ | CLOSED is final — cannot be edited |

---

# 🔒 Business Rules

| Rule | Behaviour |
|---|---|
| Only one ACTIVE budget per association per fiscal year | Returns error on create or update |
| CLOSED budget cannot be edited | Returns error on PUT |
| CLOSED budget line items cannot be changed | Returns error on PUT line-items |
| ACTIVE budget cannot be deleted | Returns error — close it first |
| All account IDs must belong to tenant's Chart of Accounts | Returns error with invalid IDs listed |
| End date must be after start date | Returns validation error |
| All endpoints tenant-isolated | Other tenant data never visible |
