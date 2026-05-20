# 📘 Unit Ledger API –  Testing Guide

## 🔄 Endpoint: Summary endpoint 

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/units/1/ledger/summary`
- **Request Name**: Summary 

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "currentBalance": 1200.00,
    "totalCharges": 5000.00,
    "totalPayments": 3800.00
  }

}
```
- **Response Status**: 200 OK

----

## 🔄 Endpoint: Transactions endpoint

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/units/1/ledger`
- **Request Name**: Transactions

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "totalElements": 0,
    "totalPages": 0,
    "size": 0,
    "content": [
      {
        "id": 0,
        "date": "2026-05-19",
        "description": "string",
        "accountName": "string",
        "transactionType": "string",
        "amount": 0,
        "runningBalance": 0
      }
    ],
    "number": 0,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "numberOfElements": 0,
    "first": true,
    "last": true,
    "pageable": {
      "offset": 0,
      "sort": {
        "empty": true,
        "sorted": true,
        "unsorted": true
      },
      "pageSize": 0,
      "pageNumber": 0,
      "paged": true,
      "unpaged": true
    },
    "empty": true
  },
  "error": "string",
  "errorCode": "string"
}
```
- **Response Status**: 200 OK
- you can filter this transaction endpoints 
- Only Charges
  GET `http://localhost:8080/api/v1/units/1/ledger?type=CHARGE`
- Only Payments
  GET `http://localhost:8080/api/v1/units/1/ledger?type=PAYMENT`
- All
  GET `http://localhost:8080/api/v1/units/1/ledger?type=ALL`
- Test With Date Range
  GET `http://localhost:8080/api/v1/units/1/ledger?from=2026-05-01&to=2026-05-31`
 Date format must be:
   yyyy-MM-dd
- Test With Pagination
  GET `http://localhost:8080/api/v1/units/1/ledger?page=0&size=5`

Page starts at 0.

----
