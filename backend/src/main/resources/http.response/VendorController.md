# 📘 Vendor API –  Testing Guide

## 🔄 Endpoint: Create Vendor

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}} /api/v1/vendors`
- **Request Name**: Create Vendor
- ### 📤 Request Body (JSON)
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "companyName": "Green Thumb Landscaping",
  "serviceCategory": "Landscaping",
  "email": "john@greenthumb.com",
  "altEmail": null,
  "mobilePhone": "(555) 123-4567",
  "workPhone": "(555) 123-4568",
  "homePhone": null,
  "website": "www.greenthumb.com",
  "street": "123 Garden Lane",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "country": "United States",
  "taxIdentityType": "EIN (Employer Identification Number)",
  "taxPayerId": "12-3456789",
  "insuranceProvider": "ABC Insurance Co.",
  "policyNumber": "POL-123456",
  "insuranceExpiry": "2026-12-31",
  "notes": "Preferred vendor for landscaping services",
  "status": "ACTIVE"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "companyName": "Green Thumb Landscaping",
  "serviceCategory": "Landscaping",
  "email": "john@greenthumb.com",
  "altEmail": null,
  "mobilePhone": "(555) 123-4567",
  "workPhone": "(555) 123-4568",
  "homePhone": null,
  "website": "www.greenthumb.com",
  "street": "123 Garden Lane",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "country": "United States",
  "taxIdentityType": "EIN (Employer Identification Number)",
  "taxPayerId": "12-3456789",
  "insuranceProvider": "ABC Insurance Co.",
  "policyNumber": "POL-123456",
  "insuranceExpiry": "2026-12-31",
  "notes": "Preferred vendor for landscaping services",
  "status": "ACTIVE",
  "createdAt": "2026-05-05T08:32:20.574311100Z"
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
  "firstName": "John",
  "lastName": "Smith",
  "companyName": "Green Thumb Landscaping",
  "serviceCategory": "Landscaping",
  "email": "john@greenthumb.com",
  "altEmail": null,
  "mobilePhone": "(555) 123-4567",
  "workPhone": "(555) 123-4568",
  "homePhone": null,
  "website": "www.greenthumb.com",
  "street": "123 Garden Lane",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "country": "United States",
  "taxIdentityType": "EIN (Employer Identification Number)",
  "taxPayerId": "12-3456789",
  "insuranceProvider": "ABC Insurance Co.",
  "policyNumber": "POL-123456",
  "insuranceExpiry": "2026-12-31",
  "notes": "Preferred vendor for landscaping services",
  "status": "ACTIVE",
  "createdAt": "2026-05-05T08:32:20.574311Z"
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
    "createdAt": "2026-05-05T08:32:20.574311Z",
    "id": 1,
    "firstName": "John",
    "lastName": "Smith",
    "companyName": "Green Thumb Landscaping",
    "serviceCategory": "Landscaping",
    "email": "john@greenthumb.com",
    "altEmail": null,
    "mobilePhone": "(555) 123-4567",
    "workPhone": "(555) 123-4568",
    "homePhone": null,
    "website": "www.greenthumb.com",
    "street": "123 Garden Lane",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "United States",
    "taxIdentityType": "EIN (Employer Identification Number)",
    "taxPayerId": "12-3456789",
    "insuranceProvider": "ABC Insurance Co.",
    "policyNumber": "POL-123456",
    "insuranceExpiry": "2026-12-31",
    "notes": "Preferred vendor for landscaping services",
    "status": "ACTIVE",
    "updatedAt": null
  },
  {
    "tenantId": 0,
    "createdAt": "2026-05-05T08:34:27.925161Z",
    "id": 2,
    "firstName": "John",
    "lastName": "Smith",
    "companyName": "ABC Plumbing Services",
    "serviceCategory": "Plumbing",
    "email": "sarah@abcplumbing.com",
    "altEmail": null,
    "mobilePhone": "(555) 123-4567",
    "workPhone": "(555) 123-4568",
    "homePhone": null,
    "website": "www.greenthumb.com",
    "street": "123 Garden Lane",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "United States",
    "taxIdentityType": "EIN (Employer Identification Number)",
    "taxPayerId": "12-3456789",
    "insuranceProvider": "ABC Insurance Co.",
    "policyNumber": "POL-123456",
    "insuranceExpiry": "2026-12-31",
    "notes": "Preferred vendor for landscaping services",
    "status": "ACTIVE",
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
  "firstName": "John",
  "lastName": "Smith",
  "companyName": "Green Thumb Landscaping Updated",
  "serviceCategory": "Landscaping",
  "email": "john@greenthumb.com",
  "altEmail": "john.alt@greenthumb.com",
  "mobilePhone": "(555) 123-4567",
  "workPhone": "(555) 123-4568",
  "homePhone": "(555) 123-4569",
  "website": "www.greenthumb.com",
  "street": "123 Garden Lane",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "country": "United States",
  "taxIdentityType": "EIN (Employer Identification Number)",
  "taxPayerId": "12-3456789",
  "insuranceProvider": "ABC Insurance Co.",
  "policyNumber": "POL-123456",
  "insuranceExpiry": "2026-12-31",
  "notes": "Updated notes",
  "status": "ACTIVE"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "companyName": "Green Thumb Landscaping Updated",
  "serviceCategory": "Landscaping",
  "email": "john@greenthumb.com",
  "altEmail": "john.alt@greenthumb.com",
  "mobilePhone": "(555) 123-4567",
  "workPhone": "(555) 123-4568",
  "homePhone": "(555) 123-4569",
  "website": "www.greenthumb.com",
  "street": "123 Garden Lane",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "country": "United States",
  "taxIdentityType": "EIN (Employer Identification Number)",
  "taxPayerId": "12-3456789",
  "insuranceProvider": "ABC Insurance Co.",
  "policyNumber": "POL-123456",
  "insuranceExpiry": "2026-12-31",
  "notes": "Updated notes",
  "status": "ACTIVE",
  "createdAt": "2026-05-05T08:32:20.574311Z"
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
