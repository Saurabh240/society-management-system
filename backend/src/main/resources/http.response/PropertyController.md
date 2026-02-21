# 📦 SocietyManagement API – Property Controller

## 🔄 Endpoint: Create Property

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/properties`
- **Request Name**: Create Property

### 📤 Request Body (JSON)
```json
{
  "name": "Tower A - 101",
  "communityId": 1
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tower A - 101",
    "tenantId": 1,
    "communityId": 1,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```
- **Response Status**: 201 Created

### ❌ Error Responses

**Tenant ID not found** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Tenant id not found",
  "errorCode": "COMMUNITY_ERROR"
}
```

**Community not found** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Community not found",
  "errorCode": "COMMUNITY_ERROR"
}
```

**Property name already exists in community** — `409 Conflict`
```json
{
  "success": false,
  "error": "Property with name 'Tower A - 101' already exists in community '1'",
  "errorCode": "PROPERTY_ERROR"
}
```

----
## 🔄 Endpoint: Update Property

### ✅ Request Details

- **Type**: PATCH
- **URL**: `http://localhost:8080/properties/1`
- **Request Name**: Update Property

### 📤 Request Body (JSON)
```json
{
  "name": "Tower A - 102"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tower A - 102",
    "tenantId": 1,
    "communityId": 1,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-02T12:00:00Z"
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Property not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Property not found",
  "errorCode": "PROPERTY_ERROR"
}
```

**Property name already exists in community** — `409 Conflict`
```json
{
  "success": false,
  "error": "Property with name 'Tower A - 102' already exists in community '1'",
  "errorCode": "PROPERTY_ERROR"
}
```

----
## 🔄 Endpoint: Get Property

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/properties/1`
- **Request Name**: Get Property

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tower A - 102",
    "tenantId": 1,
    "communityId": 1,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-02T12:00:00Z"
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Property not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Property not found",
  "errorCode": "PROPERTY_ERROR"
}
```

----
## 🔄 Endpoint: Get All Properties of Tenant

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/properties`
- **Request Name**: Get All Properties

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tower A - 102",
      "tenantId": 1,
      "communityId": 1,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-02T12:00:00Z"
    },
    {
      "id": 2,
      "name": "Tower B - 205",
      "tenantId": 1,
      "communityId": 1,
      "createdAt": "2024-01-03T09:00:00Z",
      "updatedAt": "2024-01-03T09:00:00Z"
    }
  ]
}
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Get Properties by Community

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/properties/community/1`
- **Request Name**: Get Properties by Community

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tower A - 102",
      "tenantId": 1,
      "communityId": 1,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-02T12:00:00Z"
    },
    {
      "id": 2,
      "name": "Tower B - 205",
      "tenantId": 1,
      "communityId": 1,
      "createdAt": "2024-01-03T09:00:00Z",
      "updatedAt": "2024-01-03T09:00:00Z"
    }
  ]
}
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Delete Property

### ✅ Request Details

- **Type**: DELETE
- **URL**: `http://localhost:8080/properties/1`
- **Request Name**: Delete Property

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": null
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Property not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Property not found",
  "errorCode": "PROPERTY_ERROR"
}
```

----
