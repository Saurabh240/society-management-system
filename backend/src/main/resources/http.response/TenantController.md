# 📦 Tenant Controller API – Test Results

This document explains the complete multi-tenant lifecycle flow:

🛠 Platform Admin Bootstrap
🔐 Platform Admin Login
🏢 Create Tenant
👤 Register Tenant Admin
🔑 Tenant Admin Login

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/users/login`
- **Request Name**: Login User

### 📤 Request Body (JSON)
```json
{
  "email": "platform@admin.com",
  "password": "Admin@123"
}

```

### 📤 Response Body (JSON)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwbGF0Zm9ybUBhZG1pbi5jb20iLCJ0ZW5hbnRJZCI6MCwicm9sZSI6IlBMQVRGT1JNX0FETUlOIiwiaWF0IjoxNzcxMzM4Njg4LCJleHAiOjE3NzE0MjUwODh9.oKoWA4LFz5WDL8QkaTVo2kmpCic-ioomeT7obnBeR-M",
  "role": "PLATFORM_ADMIN"
}
```
- **Response Status**: 200 OK
----
## 🔄 Endpoint: Create Tenant

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/platform/tenants`
- **Request Name**: Login

### 📤 Request Body (JSON)
```json
{
  "name": "Tenant One",
  "subdomain": "tenant1"
}
```
### 📤 Response Body (JSON)
```json
{
  "id": 2,
  "name": "Tenant One",
  "subdomain": "tenant1"
}
```
- **Response Status**: 200 OK
----

## 🔄 Endpoint: Update Tenant

### ✅ Request Details

- **Type**: PUT
- **URL**: `{{baseUrl}}/platform/tenants/1`
- **Request Name**: Update Tenant

### 📤 Request Body (JSON)
```json
{
  "name": "Green Valley HOA",
  "streetAddress": "123 Main Street",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "phone": "(555) 123-4567",
  "email": "admin@greenvalley.com",
  "accountOwner": "John Smith",
  "accountUrl": "greenvalley.gstechsystem.com",
  "status": "ACTIVE"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "id": 1,
  "name": "Green Valley HOA",
  "subdomain": "tenant1",
  "status": "ACTIVE",
  "streetAddress": "123 Main Street",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "phone": "(555) 123-4567",
  "email": "admin@greenvalley.com",
  "accountOwner": "John Smith",
  "accountUrl": "greenvalley.gstechsystem.com"
}
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Get Tenant by Id

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/platform/tenants/1`
- **Request Name**: Get Tenants By Id


### 📤 Response Body (JSON)
```json
{
  "id": 1,
  "name": "Green Valley HOA",
  "subdomain": "tenant1",
  "status": "ACTIVE",
  "streetAddress": "123 Main Street",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "phone": "(555) 123-4567",
  "email": "admin@greenvalley.com",
  "accountOwner": "John Smith",
  "accountUrl": "greenvalley.gstechsystem.com"
}
```
- **Response Status**: 200 OK
----

## 🔄 Endpoint: List Tenant

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/platform/tenants`
- **Request Name**: List Tenants


### 📤 Response Body (JSON)
```json
[
  {
    "id": 1,
    "name": "Tenant One",
    "subdomain": "tenant1"
  }
]
```
- **Response Status**: 200 OK
----
