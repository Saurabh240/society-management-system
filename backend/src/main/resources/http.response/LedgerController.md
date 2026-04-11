# 📘 General Ledger API –  Testing Guide

## 🔄 Endpoint: Create Ledger

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/accounting/ledger`
- **Request Name**: Create Ledger
- ### 📤 Request Body (JSON)
```json
{ "journalId": 1,
  "accountId": 2,
  "associationId": 1,
  "date": "2024-05-01",
  "description": "Office rent payment",
  "debit": 5000.00,
  "credit": 0.00,
  "accountingBasis": " CASH"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "id": 4,
  "tenantId": 0,
  "journalId": 1,
  "accountId": 2,
  "associationId": 1,
  "date": "2024-05-01",
  "description": "Office rent payment",
  "debit": 5000.00,
  "credit": 0.00,
  "accountingBasis": "CASH",
  "createdAt": "2026-04-11T11:56:50.692289200Z"
}
```
- **Response Status**: 200 OK
- ----

## 🔄 Endpoint: List Ledger

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/accounting/ledger`
- **Request Name**: List Ledger

### ✅ Response Body (JSON) — Success
```json
{
  "content": [
    {
      "id": 4,
      "tenantId": 0,
      "journalId": 1,
      "accountId": 2,
      "associationId": 1,
      "date": "2024-05-01",
      "description": "Office rent payment",
      "debit": 5000.0000,
      "credit": 0.0000,
      "accountingBasis": "CASH",
      "createdAt": "2026-04-11T11:56:50.692289Z"
    },
    {
      "id": 3,
      "tenantId": 0,
      "journalId": 1,
      "accountId": 2,
      "associationId": 1,
      "date": "2024-04-01",
      "description": "Office rent payment",
      "debit": 5000.0000,
      "credit": 0.0000,
      "accountingBasis": "CASH",
      "createdAt": "2026-04-10T18:40:03.931476Z"
    },
    {
      "id": 2,
      "tenantId": 0,
      "journalId": 1,
      "accountId": 1,
      "associationId": 1,
      "date": "2024-04-01",
      "description": "Office rent payment",
      "debit": 5000.0000,
      "credit": 0.0000,
      "accountingBasis": "CASH",
      "createdAt": "2026-04-10T18:35:30.366501Z"
    },
    {
      "id": 1,
      "tenantId": 0,
      "journalId": 1,
      "accountId": 1,
      "associationId": 1,
      "date": "2024-04-01",
      "description": "Office rent payment",
      "debit": 5000.0000,
      "credit": 0.0000,
      "accountingBasis": "ACCRUAL",
      "createdAt": "2026-04-10T18:33:09.435590Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "empty": true,
      "sorted": false,
      "unsorted": true
    },
    "offset": 0,
    "unpaged": false,
    "paged": true
  },
  "last": true,
  "totalPages": 1,
  "totalElements": 4,
  "size": 20,
  "number": 0,
  "sort": {
    "empty": true,
    "sorted": false,
    "unsorted": true
  },
  "numberOfElements": 4,
  "first": true,
  "empty": false
}
```
- **Response Status**: 200 OK

----
## How It Works with search and filters
```
GET {{baseUrl}}/api/v1/accounting/ledger  → Get All Entries(Basic)
GET {{baseUrl}}/api/v1/accounting/ledger?associationId=1    → Filter by Association
GET {{baseUrl}}/api/v1/accounting/ledger?accountId=1        → Filter by Account
GET {{baseUrl}}/api/v1/accounting/ledger?from=2024-01-01&to=2024-12-31   → Date Range Filter
GET {{baseUrl}}/api/v1/accounting/ledger?basis=CASH         → Accounting Basis Filter
GET {{baseUrl}}/api/v1/accounting/ledger?associationId=1&accountId=1&from=2024-01-01&to=2024-12-31&basis=ACCRUAL   → Combined Filters

```