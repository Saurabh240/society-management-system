# 📘 Chart of Accounts (COA) API –  Testing Guide

## 🔄 Endpoint: Create Account

### ✅ Request Details

- **Type**: POST
- **URL**: ` {{baseUrl}}/api/v1/accounting/coa`
- **Request Name**: Create Account
- ### 📤 Request Body (JSON)
```json
{ "accountCode": "4001",
  "accountName": "HOA Fees",
  "accountType": "INCOME",
  "notes": "Regular monthly or annual assessments"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "id": 5,
  "tenantId": 0,
  "accountCode": "4001",
  "accountName": "HOA Fees",
  "accountType": "INCOME",
  "notes": "Regular monthly or annual assessments",
  "createdAt": "2026-04-08T17:06:45.742519300Z"
}
```
- **Response Status**: 200 OK
- ----
## 🔄 Endpoint:  List All Accounts

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/accounting/coa`
- **Request Name**: Get All Accounts
- ### ✅ Response Body (JSON) — Success
```json
{
  "content": [
    {
      "id": 1,
      "tenantId": 0,
      "accountCode": "1000",
      "accountName": "Cash - Operating Account",
      "accountType": "ASSETS",
      "notes": "Primary operating account",
      "createdAt": "2026-04-08T14:45:40.748325Z"
    },
    {
      "id": 2,
      "tenantId": 0,
      "accountCode": "2000",
      "accountName": "Accounts Payable",
      "accountType": "LIABILITIES",
      "notes": "Outstanding payments due to vendors",
      "createdAt": "2026-04-08T16:58:03.044143Z"
    },
    {
      "id": 3,
      "tenantId": 0,
      "accountCode": "3000",
      "accountName": "Retained Earnings",
      "accountType": "EQUITY",
      "notes": "Accumulated earnings from prior years",
      "createdAt": "2026-04-08T16:59:24.060016Z"
    },
    {
      "id": 4,
      "tenantId": 0,
      "accountCode": "4000",
      "accountName": "HOA Fees",
      "accountType": "INCOME",
      "notes": "Regular monthly or annual assessments",
      "createdAt": "2026-04-08T17:00:25.008684Z"
    },
    {
      "id": 5,
      "tenantId": 0,
      "accountCode": "4001",
      "accountName": "HOA Fees",
      "accountType": "INCOME",
      "notes": "Regular monthly or annual assessments",
      "createdAt": "2026-04-08T17:06:45.742519Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "last": true,
  "totalPages": 1,
  "totalElements": 5,
  "size": 20,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 5,
  "first": true,
  "empty": false
}

```
- **Response Status**: 200 OK

----
## How It Works with search and filters
```
GET /coa                              → Get All Accounts (Basic)
GET /coa?search=cash&type=ASSETS      → Combined Search + Filter
GET /coa?type=ASSETS                  → Filter by Account Type
GET /coa?search=cash                  → Search Accounts
GET /coa?search=2000                  → Search by Account code
GET /coa?page=0&size=10               → Pagination
GET /coa?sort=accountCode             → Sort by accountCode (default)

```
## 🔄 Endpoint: Update Account

### ✅ Request Details

- **Type**: PUT
- **URL**: ` {{baseUrl}}/api/v1/accounting/coa/1`
- **Request Name**: Update Account

### 📤 Request Body (JSON)
```json
{ "accountCode": "1000",
  "accountName": "Cash - Updated",
  "accountType": "ASSETS",
  "notes": "Updated notes"
}
```
> All fields are optional. Only provided fields will be updated.

### ✅ Response Body (JSON) — Success
```json
{
  "id": 1,
  "tenantId": 0,
  "accountCode": "1000",
  "accountName": "Cash - Updated",
  "accountType": "ASSETS",
  "notes": "Updated notes",
  "createdAt": "2026-04-08T14:45:40.748325Z"
}
```
- **Response Status**: 200 OK

----

## 🔄 Endpoint: Delete Account

### ✅ Request Details

- **Type**: DELETE Sms
- **URL**: `{{baseUrl}}/api/v1/accounting/coa/4`
- **Request Name**: Delete account id

- **Response Status**: 204 OK
-----
