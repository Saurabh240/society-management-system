# 📘Unit Invoice API — Testing Guide

## Prerequisites — Run These First
> Before testing invoices, make sure you have:
> 1. An Association
> 2. A Unit in that Association
→ Note the returned id as {unitId}
> 3. An ASSETS COA Account (for Accounts Receivable debit side)
> 4. An INCOME COA Account (for invoice line items)
     → Note the returned id as {incomeAccountId}

## 🔄 Endpoint: Create Invoice

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/units/1/invoices`
- **Request Name**: Create Invoice
- ### 📤 Request Body (JSON)
```json
{
     "invoiceDate": "2026-09-22",
     "dueDate": "2026-10-05",
     "lineItems": [
          { "description": "Monthly HOA Fee", "incomeAccountId": 14, "amount": 200.00 }
     ]
}
```

### ✅ Response Body (JSON) — Success
```json
{
     "success": true,
     "data": {
          "id": 1,
          "unitId": 1,
          "unitNumber": "101",
          "associationId": 1,
          "invoiceDate": "2026-09-22",
          "dueDate": "2026-10-05",
          "totalAmount": 200.00,
          "notes": null,
          "lineItems": [
               {
                    "id": 1,
                    "description": "Monthly HOA Fee",
                    "incomeAccountId": 14,
                    "incomeAccountName": "HOA Fees",
                    "amount": 200.00
               }
          ],
          "createdAt": "2026-09-23T06:09:44.421298100Z"
     }
}
```
- **Response Status**: 200 OK
- ----
## 🔄 Endpoint:  List Invoice

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/units/1/invoices`
- **Request Name**: List invoice
- ### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "unitId": 1,
      "unitNumber": "A-101",
      "associationId": 1,
      "invoiceDate": "2026-05-01",
      "dueDate": "2026-05-15",
      "totalAmount": 350.00,
      "notes": "Monthly HOA assessment — May 2026",
      "lineItems": [
        {
          "id": 1,
          "description": "Monthly HOA Fee",
          "incomeAccountId": 5,
          "incomeAccountName": "HOA Fees",
          "amount": 300.00
        },
        {
          "id": 2,
          "description": "Pool Maintenance Assessment",
          "incomeAccountId": 5,
          "incomeAccountName": "HOA Fees",
          "amount": 50.00
        }
      ],
      "createdAt": "2026-05-19T08:59:45.703164Z"
    }
  ]
}

```
- **Response Status**: 200 OK
---
## Validation: Wrong Account Type (must return 400)
- Use a LIABILITIES account ID as incomeAccountId:
## Request Body
- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/units/1/invoices`
- **Request Name**: Create Invoice
````
{
  "invoiceDate": "2026-05-01",
  "dueDate": "2026-05-15",
  "lineItems": [
    {
      "description": "Test",
      "incomeAccountId": 6,
      "amount": 100.00
    }
  ]
}
````
### Response body
````
{
    "success": false,
    "error": "Account 'Accounts Payable' must be type INCOME",
    "errorCode": "BAD_REQUEST"
}
````
- **Response Status**: 400 Bad request
## Validation: Zero Amount (must return 400)

### Request body 
- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/units/1/invoices`
- **Request Name**: Create Invoice
````
{
  "invoiceDate": "2026-05-01",
  "dueDate": "2026-05-15",
  "lineItems": [
    {
      "description": "Test",
      "incomeAccountId": 5,
      "amount": 0.0
    }
  ]
}
````
### Response Body
````
{
"success": false,
"error": "lineItems[0].amount: Amount must be greater than zero",
"errorCode": "VALIDATION_ERROR"
}
````
- **Response Status**: 400 Bad request

##  Unit Not Found (must return 404)
### Request Body 
- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/units/99/invoices`
- **Request Name**: Create Invoice
````
{
  "success": true,
  "data": {
    "id": 1,
    "unitId": 1,
    "unitNumber": "201",
    "associationId": 1,
    "invoiceDate": "2026-05-01",
    "dueDate": "2026-05-15",
    "totalAmount": 350.00,
    "notes": "Monthly HOA assessment — May 2026",
    "lineItems": [
      {
        "id": 1,
        "description": "Monthly HOA Fee",
        "incomeAccountId": 1,
        "incomeAccountName": "Assessment Income",
        "amount": 300.00
      },
      {
        "id": 2,
        "description": "Pool Maintenance Assessment",
        "incomeAccountId": 1,
        "incomeAccountName": "Assessment Income",
        "amount": 50.00
      }
    ],
    "createdAt": "2026-05-01T..."
  }
}
````
### Response Body
````
{
"success": false,
"error": "Unit not found: 4",
"errorCode": "INTERNAL_ERROR"
}
````
-------

## 🔄 Endpoint: Record a Payment

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/units/{unitId}/invoices/{invoiceId}/payments`
- **Request Name**: Create Invoice
- ### 📤 Request Body (JSON)
```json
{
     "amount": 120.00,
     "paymentDate": "2026-10-05",
     "bankAccountId": 1,
     "memo": "Partial payment via check #4521"
}
```

### ✅ Response Body (JSON) — Success
```json
{
     "success": true,
     "data": {
          "id": 1,
          "amount": 120.00,
          "paymentDate": "2026-10-05",
          "bankAccountId": 1,
          "bankAccountName": "Operating Account",
          "memo": "Partial payment via check #4521"
     }
}
```
- **Response Status**: 200 OK
- ----

## 🔄 Endpoint: Record a Payment — With Idempotency Key
### ✅ Request Details
**Type**: POST
- **URL**: {{baseUrl}}/api/v1/units/{unitId}/invoices/{invoiceId}/payments
- **Request Name**: Record Invoice Payment (idempotent)
- ### 📤 Request Body (JSON)
```json
{
     "amount": 80.00,
     "paymentDate": "2026-10-07",
     "bankAccountId": 1,
     "idempotencyKey": "retry-abc123"
}
```

### ✅ Response Body (JSON) — Success
```json
{
     "success": true,
     "data": {
          "id": 2,
          "amount": 80.00,
          "paymentDate": "2026-10-07",
          "bankAccountId": 1,
          "bankAccountName": "Operating Account",
          "memo": null
     }
}
```
- **Response Status**: 200 OK
- ----

## 🔄 Endpoint: Record a Payment — Already Fully Paid
### ✅ Request Details
**Type**: POST
- **URL**: {{baseUrl}}/api/v1/units/{unitId}/invoices/{invoiceId}/payments
- **Request Name**: Record Invoice Payment (idempotent)
- ### 📤 Request Body (JSON)
```json
{
     "amount": 10.00,
     "paymentDate": "2026-10-08",
     "bankAccountId": 1
}
```

### ✅ Response Body (JSON) — Success
```json
{
     "success": false,
     "error": "Invoice is already paid",
     "errorCode": "INTERNAL_ERROR"
}
```
- **Response Status**: 400 Bad request
- ----

## 🔄 Endpoint: Get Payment History
### ✅ Request Details
**Type**: GET
- **URL**: {{baseUrl}}/api/v1/units/1/invoices/3/payments
- **Request Name**: Get Invoice Payments


### ✅ Response Body (JSON) — Success
```json
{
     "success": true,
     "data": [
          {
               "id": 3,
               "amount": 80.00,
               "paymentDate": "2026-10-07",
               "bankAccountId": 1,
               "bankAccountName": "Operating Account",
               "memo": null
          },
          {
               "id": 2,
               "amount": 120.00,
               "paymentDate": "2026-10-05",
               "bankAccountId": 2,
               "bankAccountName": "1000 - Cash - Operating Account",
               "memo": null
          }
     ]
}
```
- **Response Status**: 200 OK
- ----