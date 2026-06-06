# 📦 Association Reports API

### Prerequisites
### - Ensure the following exist before testing:

- At least 1 Association
- At least 1 Vendor with bills (some PAID, some OVERDUE)
- At least 1 Unit with invoices created via POST /api/v1/units/{unitId}/invoices
- At least 1 Owner assigned to a unit

### Report 1 — Vendor Spending
### -Test 1a — All associations, last year (default)

## 🔄 Endpoint: GET Vendor Spending
### ✅ Request Details

- **Type**: GET
- **URL**: ` {{baseUrl}}/api/v1/reports/vendor-spending?from=2026-01-01&to=2026-05-31`
- **Request Name**: Get Vendor Spending


### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "from": "2026-01-01",
    "to": "2026-05-31",
    "totalSpent": 1400.00,
    "vendors": [
      {
        "vendorId": 1,
        "vendorName": "Green Thumb Landscaping Updated",
        "serviceCategory": "Landscaping",
        "billCount": 2,
        "totalBilled": 1400.00,
        "totalPaid": 1400.00,
        "outstanding": 0.00
      },
      {
        "vendorId": 10,
        "vendorName": "Unknown",
        "serviceCategory": "—",
        "billCount": 1,
        "totalBilled": 800.00,
        "totalPaid": 0,
        "outstanding": 800.00
      }
    ]
  }
}
```
- **Response Status**: 200 OK
- ----

### -Test 1b  — Specific association

### ✅ Request Details

- **Type**: GET
- **URL**: ` {{baseUrl}}/api/v1/reports/vendor-spending?associationId=1&from=2026-01-01&to=2026-05-31`
- **Request Name**: Get Vendor Spending


### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "from": "2026-01-01",
    "to": "2026-05-31",
    "totalSpent": 1400.00,
    "vendors": [
      {
        "vendorId": 1,
        "vendorName": "Green Thumb Landscaping Updated",
        "serviceCategory": "Landscaping",
        "billCount": 2,
        "totalBilled": 1400.00,
        "totalPaid": 1400.00,
        "outstanding": 0.00
      },
      {
        "vendorId": 10,
        "vendorName": "Unknown",
        "serviceCategory": "—",
        "billCount": 1,
        "totalBilled": 800.00,
        "totalPaid": 0,
        "outstanding": 800.00
      }
    ]
  }
}
```
- **Response Status**: 200 OK
- ----
### -Test 1c —  Custom date range
### ✅ Request Details

- **Type**: GET
- **URL**: `/api/v1/reports/vendor-spending?dateRange=CUSTOM&from=2026-01-01&to=2026-03-31`
- **Request Name**: Get Vendor Spending


### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "from": "2026-01-01",
    "to": "2026-03-31",
    "totalSpent": 0,
    "vendors": []
  }
}
```
- **Response Status**: 200 OK
- ----
## Report 2 — Assessment History 
### -Test 2a — All associations, last year
## 🔄 Endpoint: GET Assesment History
### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/api/v1/reports/assessment-history?from=2026-01-01&to=2026-05-31`
- **Request Name**: Get Assesment History


### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "from": "2025-06-01",
    "to": "2026-06-01",
    "totalAssessed": 0,
    "totalCollected": 0,
    "collectionRate": 0,
    "assessments": []
  }
}
```
- **Response Status**: 200 OK
- ----
### -Test 2b —Specific association filter

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/reports/assessment-history?associationId=1&from=2026-01-01&to=2026-06-01`
- **Request Name**: Get Assesment History


### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "from": "2026-01-01",
    "to": "2026-06-01",
    "totalAssessed": 2500.00,
    "totalCollected": 2500.00,
    "collectionRate": 100.0000,
    "assessments": [
      {
        "invoiceId": 1,
        "associationName": "Green Valley Residency",
        "unitNumber": "A-101",
        "ownerName": "pqr lmn",
        "invoiceDate": "2026-04-20",
        "dueDate": "2026-05-05",
        "amount": 2500.00,
        "status": "PAID"
      }
    ]
  }
}
```
- **Response Status**: 200 OK
- ----

### -Test 2c — Custom date range

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/reports/assessment-history?dateRange=CUSTOM&from=2026-04-01&to=2026-04-30`
- **Request Name**: Get Assesment History


### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "from": "2026-04-01",
    "to": "2026-04-30",
    "totalAssessed": 0,
    "totalCollected": 0,
    "collectionRate": 0,
    "assessments": []
  }
}
```
- **Response Status**: 200 OK
- ----

## Report 3 —  Unit Owner Statement
### -Test 3a —full statement
## 🔄 Endpoint: GET Unit owner statement
### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/reports/unit-owner-statement?associationId=1&unitId=1&from=2026-01-01&to=2026-05-31`
- **Request Name**: Get Unit owner statement


### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "unitId": 1,
    "unitNumber": "A-101",
    "associationName": "Green Valley Residency",
    "ownerName": "pqr lmn",
    "ownerEmail": "pqr.lmno@example.com",
    "from": "2026-01-01",
    "to": "2026-05-31",
    "openingBalance": -400.0000,
    "totalCharges": 2500.00,
    "totalPayments": 1750.0000,
    "closingBalance": 350.0000,
    "transactions": [
      {
        "date": "2026-04-17",
        "description": "Cash payment: BILL-002",
        "type": "PAYMENT",
        "amount": 700.0000,
        "runningBalance": -1100.0000
      },
      {
        "date": "2026-04-20",
        "description": "Invoice #1",
        "type": "CHARGE",
        "amount": 2500.00,
        "runningBalance": 1400.0000
      },
      {
        "date": "2026-05-01",
        "description": "Monthly HOA Fee",
        "type": "PAYMENT",
        "amount": 300.0000,
        "runningBalance": 1100.0000
      },
      {
        "date": "2026-05-01",
        "description": "Pool Maintenance Assessment",
        "type": "PAYMENT",
        "amount": 50.0000,
        "runningBalance": 1050.0000
      },
      {
        "date": "2026-05-04",
        "description": "Bill payment - Cash (Operating Checking — Updated): BILL-003",
        "type": "PAYMENT",
        "amount": 700.0000,
        "runningBalance": 350.0000
      }
    ]
  }
}
```
- **Response Status**: 200 OK
- ----
### -Test 3b — Missing associationId (must return 400)

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/reports/unit-owner-statement?unitId=1&from=2026-01-01&to=2026-05-31`
- **Request Name**: Get unit owner statement


### ✅ Response Body (JSON) — Success
```json
{
  "success": false,
  "error": "Missing parameter: associationId",
  "errorCode": "BAD_REQUEST"
}
```
- **Response Status**: 400 Bad Request
- ----

### -Test 3c — when unit id doesnt belong to particular associationId (must return 400)

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/reports/unit-owner-statement?associationId=2&unitId=1&from=2026-01-01&to=2026-05-31`
- **Request Name**: Get unit owner statement


### ✅ Response Body (JSON) — Success
```json
{
  "success": false,
  "error": "Unit 1 does not belong to association 2",
  "errorCode": "BAD_REQUEST"
}
```
- **Response Status**: 400 Bad Request
- ----

### -Test 3d —  Missing unitId (must return 400)

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/reports/unit-owner-statement?unitId=1&from=2026-01-01&to=2026-05-31`
- **Request Name**: Get unit owner statement


### ✅ Response Body (JSON) — Success
```json
{
  "success": false,
  "error": "Missing parameter: associationId",
  "errorCode": "BAD_REQUEST"
}
```
- **Response Status**: 400 Bad Request
- ----

### -Test 3e — Missing from/to dates (must return 400)

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/reports/unit-owner-statement?associationId=1&unitId=99999&from=2026-01-01&to=2026-05-31`
- **Request Name**: Get unit owner statement


### ✅ Response Body (JSON) — Success
```json
{
  "success": false,
  "error": "Missing parameter: associationId",
  "errorCode": "BAD_REQUEST"
}
```
- **Response Status**: 400 Bad Request
- ----