# 📦 SocietyManagement API – Association Controller

## 🔄 Endpoint: Create Association

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/association`
- **Request Name**: Create Association

### 📤 Request Body (JSON)
```json
{
  "name": "Green Valley Residency",
  "status": "ACTIVE",
  "streetAddress": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "taxIdentityType": "SSN",
  "taxPayerId": "123456789"
}
```
> **Association status** allowed values: `ACTIVE`, `INACTIVE`, `DELETED`
> **Tax identity type** allowed values: `SSN`, `EIN`
### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Green Valley Residency",
    "status": "ACTIVE",
    "tenantId": 1,
    "totalUnits": 0,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Association name already exists** — `409 Conflict`
```json
{
  "success": false,
  "error": "Association with name 'Green Valley Residency' already exists",
  "errorCode": "ASSOCIATION_ERROR"
}
```

**Tenant ID not found** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Tenant id not found",
  "errorCode": "ASSOCIATION_ERROR"
}
```

----
## 🔄 Endpoint: Update Association

### ✅ Request Details

- **Type**: PATCH
- **URL**: `http://localhost:8080/association/1`
- **Request Name**: Update Association

### 📤 Request Body (JSON)
```json
{
  "name": "Green Valley Heights",
  "status": "INACTIVE",
  "streetAddress": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "taxIdentityType": "TAX_ID",
  "taxPayerId": "123456789"
}
```
> **Association status** allowed values: `ACTIVE`, `INACTIVE`
> Note: All fields are optional for the update request.

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Green Valley Heights",
    "status": "INACTIVE",
    "tenantId": 1,
    "totalUnits": 50,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-02T12:00:00Z"
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Association not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Association not found",
  "errorCode": "ASSOCIATION_ERROR"
}
```

**Association name already exists** — `409 Conflict`
```json
{
  "success": false,
  "error": "Association with name 'Green Valley Heights' already exists",
  "errorCode": "ASSOCIATION_ERROR"
}
```

**Unauthorized access** — `403 Forbidden`
```json
{
  "success": false,
  "error": "You are not authorized to update this association",
  "errorCode": "ASSOCIATION_ERROR"
}
```

----
## 🔄 Endpoint: Get Association

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/association/1`
- **Request Name**: Get Association

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Green Valley Heights",
    "status": "INACTIVE",
    "streetAddress": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "taxIdentityType": "TAX_ID",
    "taxPayerID": "123456789",
    "totalUnits": 50
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Association not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Association not found",
  "errorCode": "ASSOCIATION_ERROR"
}
```

**Unauthorized access** — `403 Forbidden`
```json
{
  "success": false,
  "error": "You are not authorized to get this association",
  "errorCode": "ASSOCIATION_ERROR"
}
```

----
## 🔄 Endpoint: Get All Associations

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/association/all`
- **Request Name**: Get All Associations

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Green Valley Heights",
      "status": "INACTIVE",
      "tenantId": 1,
      "totalUnits": 50,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-02T12:00:00Z"
    },
    {
      "id": 2,
      "name": "Sunrise Apartments",
      "status": "ACTIVE",
      "tenantId": 1,
      "totalUnits": 120,
      "createdAt": "2024-01-03T09:00:00Z",
      "updatedAt": "2024-01-03T09:00:00Z"
    }
  ]
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Tenant ID not found** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Tenant id not found",
  "errorCode": "ASSOCIATION_ERROR"
}
```

----
## 🔄 Endpoint: Delete Association

### ✅ Request Details

- **Type**: DELETE
- **URL**: `http://localhost:8080/association/1`
- **Request Name**: Delete Association

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": null
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Association not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Association not found",
  "errorCode": "ASSOCIATION_ERROR"
}
```

**Unauthorized access** — `403 Forbidden`
```json
{
  "success": false,
  "error": "You are not authorized to delete this association",
  "errorCode": "ASSOCIATION_ERROR"
}
```

----
