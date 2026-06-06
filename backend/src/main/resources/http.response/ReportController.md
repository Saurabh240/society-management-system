# 📦Balance Sheet Report API — Testing Guide

> Accounting equation that must always hold:
> Total Assets = Total Liabilities + Total Equity

### - Prerequisites — Seed Data Before Testing:
- Step 1 — Create COA accounts (one per type minimum)
- Step 2 — Create a Bill and Pay It (generates ledger entries)
- Step 3 — Create a Unit Invoice (generates income ledger entries)
----

### TEST 1:
## 🔄 Endpoint: Get balance sheet as of date

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/api/v1/accounting/reports/balance-sheet?associationId=1&asOfDate=2026-05-28`
- **Request Name**: Get balance sheet as of date

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-05-28",
    "associationId": 1,
    "assets": [
      {
        "accountCode": "1000",
        "accountName": "Cash - Updated",
        "balance": -9650.0000
      }
    ],
    "liabilities": [
      {
        "accountCode": "2000",
        "accountName": "Accounts Payable",
        "balance": -5700.0000
      },
      {
        "accountCode": "2001",
        "accountName": "Accounts Payable",
        "balance": -5000.0000
      }
    ],
    "equity": [],
    "totalAssets": -9650.0000,
    "totalLiabilities": -10700.0000,
    "totalEquity": 0,
    "equationDifference": 1050.0000,
    "balanced": false
  }
}
```
- **Response Status**: 200 OK
- ----
### TEST 2: All Associations (no associationId filter)

## 🔄 Endpoint: Get balance sheet of All Associations

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/api/v1/accounting/reports/balance-sheet?asOfDate=2026-05-28`
- **Request Name**: Get balance sheet as of date

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-05-28",
    "associationId": null,
    "assets": [
      {
        "accountCode": "1000",
        "accountName": "Cash - Updated",
        "balance": -9650.0000
      }
    ],
    "liabilities": [
      {
        "accountCode": "2000",
        "accountName": "Accounts Payable",
        "balance": -5700.0000
      },
      {
        "accountCode": "2001",
        "accountName": "Accounts Payable",
        "balance": -5000.0000
      }
    ],
    "equity": [],
    "totalAssets": -9650.0000,
    "totalLiabilities": -10700.0000,
    "totalEquity": 0,
    "equationDifference": 1050.0000,
    "balanced": false
  }
}
```
- **Response Status**: 200 OK
- ----

### TEST 3: Historical As-Of Date (before any transactions)

## 🔄 Endpoint: Get balance sheet Historical As-Of Date

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/reports/association/balance-sheet?associationId=1&asOfDate=2026-06-07`
- **Request Name**: Get balance sheet as of date

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-06-07",
    "associationId": 1,
    "assets": [
      {
        "accountCode": "1000",
        "accountName": "Cash - Updated",
        "balance": -9650.0000
      }
    ],
    "liabilities": [
      {
        "accountCode": "2000",
        "accountName": "Accounts Payable",
        "balance": -5700.0000
      },
      {
        "accountCode": "2001",
        "accountName": "Accounts Payable",
        "balance": -5000.0000
      }
    ],
    "equity": [],
    "totalAssets": -9650.0000,
    "totalLiabilities": -10700.0000,
    "totalEquity": 0,
    "equationDifference": 1050.0000,
    "balanced": false
  }
}
```
- **Response Status**: 200 OK
- ----

### TEST 4:  Validation: Missing asOfDate (must return 400)

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/api/v1/accounting/reports/balance-sheet?associationId=1`
- **Request Name**: Get balance sheet as of date

### ✅ Response Body (JSON) 
```json
{
  "success": false,
  "error": "Missing parameter: asOfDate",
  "errorCode": "BAD_REQUEST"
}
```
- **Response Status**: 400 Bad Request
- ----
