# 📘 Banking API –  Testing Guide

## 🔄 Endpoint: List Bank Account 

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/accounting/banking?associationId=1`
- **Request Name**: List Bank Account

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenantId": 0,
      "associationId": 1,
      "bankAccountName": "Operating Checking",
      "accountType": "CHECKING",
      "country": "United States",
      "routingNumber": "021000021",
      "accountNumberMasked": "****7890",
      "accountNotes": "Main operating account",
      "checkPrintingEnabled": true,
      "balance": 12450.00,
      "createdAt": "2026-04-14T05:55:55.280521Z"
    },
    {
      "id": 2,
      "tenantId": 0,
      "associationId": 1,
      "bankAccountName": "Reserve Savings",
      "accountType": "SAVINGS",
      "country": "United States",
      "routingNumber": "021000021",
      "accountNumberMasked": "****3210",
      "accountNotes": null,
      "checkPrintingEnabled": false,
      "balance": 0.00,
      "createdAt": "2026-04-14T06:03:27.933089Z"
    }
  ]
}
```
- **Response Status**: 200 OK

----

## 🔄 Endpoint: Create Bank Account
### ✅ Request Details

- **Type**: POST
- **URL**: ` {{baseUrl}}/api/v1/accounting/banking`
- **Request Name**: Create Bank Account

###  Request Body (JSON) 
```json
{
  "associationId": 1,
  "bankAccountName": "Operating Checking",
  "accountType": "CHECKING",
  "country": "United States",
  "routingNumber": "021000021",
  "accountNumber": "1234567890",
  "accountNotes": "Main operating account",
  "checkPrintingEnabled": true,
  "balance": 12450.00
}
```
### ✅ Response Body (JSON)-Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tenantId": 0,
    "associationId": 1,
    "bankAccountName": "Operating Checking",
    "accountType": "CHECKING",
    "country": "United States",
    "routingNumber": "021000021",
    "accountNumberMasked": "****7890",
    "accountNotes": "Main operating account",
    "checkPrintingEnabled": true,
    "balance": 12450.00,
    "createdAt": "2026-04-14T05:55:55.280521100Z"
  }
}
```
- **Response Status**: 200 OK
----
## Create Bank account with minimal fields
# Request Body
```json
{
  "associationId": 1,
  "bankAccountName": "Reserve Savings",
  "accountType": "SAVINGS",
  "routingNumber": "021000021",
  "accountNumber": "9876543210"
}
```
# Response Body 
```json 
{
    "success": true,
    "data": {
        "id": 2,
        "tenantId": 0,
        "associationId": 1,
        "bankAccountName": "Reserve Savings",
        "accountType": "SAVINGS",
        "country": "United States",
        "routingNumber": "021000021",
        "accountNumberMasked": "****3210",
        "accountNotes": null,
        "checkPrintingEnabled": false,
        "balance": 0,
        "createdAt": "2026-04-14T06:03:27.933088700Z"
    }
}
```
- **Response Status**: 200 OK
- country defaults to "United States"
- checkPrintingEnabled defaults to false
- balance defaults to 0
- accountNumberMasked = "****3210"
## 🔄 Endpoint: Get Account By Id

### ✅ Request Details

- **Type**: GET
- **URL**: ` {{baseUrl}}/api/v1/accounting/banking/1`
- **Request Name**: View Account by id

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tenantId": 0,
    "associationId": 1,
    "bankAccountName": "Operating Checking",
    "accountType": "CHECKING",
    "country": "United States",
    "routingNumber": "021000021",
    "accountNumberMasked": "****7890",
    "accountNotes": "Main operating account",
    "checkPrintingEnabled": true,
    "balance": 12450.00,
    "createdAt": "2026-04-14T05:55:55.280521Z"
  }
}
```
- **Response Status**: 200 OK
- ----

## 🔄 Endpoint:Update Bank Account

### ✅ Request Details

- **Type**: PUT
- **URL**: `{{baseUrl}}/api/v1/accounting/banking?associationId=1`
- **Request Name**: List Bank Account

### ✅ Request Body (JSON) — 
```json
{
  "associationId": 1,
  "bankAccountName": "Operating Checking — Updated",
  "accountType": "CHECKING",
  "country": "United States",
  "routingNumber": "021000021",
  "accountNumber": "1234567899",
  "accountNotes": "Updated notes",
  "checkPrintingEnabled": false,
  "balance": 15000.00
}
```
### Response Body(json)-Success
```json
{
    "success": true,
    "data": {
        "id": 2,
        "tenantId": 0,
        "associationId": 1,
        "bankAccountName": "Operating Checking — Updated",
        "accountType": "CHECKING",
        "country": "United States",
        "routingNumber": "021000021",
        "accountNumberMasked": "****7899",
        "accountNotes": "Updated notes",
        "checkPrintingEnabled": false,
        "balance": 15000.00,
        "createdAt": "2026-04-14T06:03:27.933089Z"
    }
}
```
- **Response Status**: 200 OK
## 🔄 Endpoint:Delete Bank Account

### ✅ Request Details

- **Type**: DELETE
- **URL**: `{{baseUrl}}/api/v1/accounting/banking/3`
- **Request Name**: Delete Bank Account

- **Response Status**: 204 no content



