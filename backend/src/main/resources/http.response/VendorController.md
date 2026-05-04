# 📘 Vendor API –  Testing Guide

## 🔄 Endpoint: Create Vendor

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}} /api/v1/vendors`
- **Request Name**: Create Vendor
- ### 📤 Request Body (JSON)
```json
{
  "companyName": "Acme Property Management",
  "contactName": "John Doe",
  "email": "klm@acmepm.com",
  "phone": "(555) 123-4567",
  "altEmail": "alt@test.com",
  "altPhone": "+918888888888",
  "street": "123 Main Street, Suite 100",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90012",
  "status": "ACTIVE",
  "serviceCategory": "Maintenance"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "id": 3,
  "companyName": "Acme Property Management",
  "contactName": "John Doe",
  "email": "klm@acmepm.com",
  "phone": "(555) 123-4567",
  "altEmail": "alt@test.com",
  "altPhone": "+918888888888",
  "street": "123 Main Street, Suite 100",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90012",
  "status": "ACTIVE",
  "serviceCategory": "Maintenance",
  "createdAt": "2026-04-25T14:45:02.109576900Z",
  "updatedAt": null
}
```
- **Response Status**: 200 OK
- ----

## 🔄 Endpoint: Get Vendor By Id

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/vendors/1`
- **Request Name**: View Vendor by id

### ✅ Response Body (JSON) — Success
```json
{
  "id": 1,
  "companyName": "Acme Property Management Services",
  "contactName": "Abc xyz",
  "email": "abc@xyz.com",
  "phone": "+919999999999",
  "altEmail": "alt@test.com",
  "altPhone": "+918888888888",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "status": "ACTIVE",
  "serviceCategory": "Maintenance",
  "createdAt": "2026-04-25T14:11:57.575881Z",
  "updatedAt": "2026-04-25T14:24:34.414651Z"
}
```
- **Response Status**: 200 OK
- ----
## 🔄 Endpoint:  List All Active Vendors

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/vendors`
- **Request Name**: Get All Active Vendors
- ### ✅ Response Body (JSON) — Success
```json
[
  {
    "tenantId": 0,
    "createdAt": "2026-04-25T14:11:57.575881Z",
    "id": 1,
    "companyName": "Acme Property Management Services",
    "contactName": "Abc xyz",
    "email": "abc@xyz.com",
    "phone": "+919999999999",
    "altEmail": "alt@test.com",
    "altPhone": "+918888888888",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "status": "ACTIVE",
    "serviceCategory": "Maintenance",
    "updatedAt": "2026-04-25T14:24:34.414651Z"
  },
  {
    "tenantId": 0,
    "createdAt": "2026-04-25T14:20:33.076680Z",
    "id": 2,
    "companyName": "Acme Property Management",
    "contactName": "John Doe",
    "email": "contact@acmepm.com",
    "phone": "(555) 123-4567",
    "altEmail": "alt@test.com",
    "altPhone": "+918888888888",
    "street": "123 Main Street, Suite 100",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90012",
    "status": "ACTIVE",
    "serviceCategory": "Maintenance",
    "updatedAt": null
  }
]

```
- **Response Status**: 200 OK
---

## 🔄 Endpoint: Update Account

### ✅ Request Details

- **Type**: PUT
- **URL**: `{{baseUrl}}/api/v1/vendors/1`
- **Request Name**: Update Account

### 📤 Request Body (JSON)
```
{
  "companyName": "Acme Property Management Services",
  "contactName": "Abc xyz",
  "email": "abc@xyz.com",
  "phone": "+919999999999",
  "altEmail": "alt@test.com",
  "altPhone": "+918888888888",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "status": "ACTIVE",
  "serviceCategory": "Maintenance"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "id": 1,
  "companyName": "Acme Property Management Services",
  "contactName": "Abc xyz",
  "email": "abc@xyz.com",
  "phone": "+919999999999",
  "altEmail": "alt@test.com",
  "altPhone": "+918888888888",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "status": "ACTIVE",
  "serviceCategory": "Maintenance",
  "createdAt": "2026-04-25T14:11:57.575881Z",
  "updatedAt": "2026-04-25T14:24:34.414651Z"
}
```
- **Response Status**: 200 OK

----

## 🔄 Endpoint: Delete Vendor By Id

### ✅ Request Details

- **Type**: DELETE Sms
- **URL**: `{{baseUrl}}/api/v1/vendors/3`
- **Request Name**: Delete Vendor id

- **Response Status**: 204 No Content
-----
