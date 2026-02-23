# 📦 SocietyManagement API – Community Controller

## 🔄 Endpoint: Create Community

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/community`
- **Request Name**: Create Community

### 📤 Request Body (JSON)
```json
{
  "name": "Green Valley Residency"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Green Valley Residency",
    "status": "ACTIVE",
    "tenantId": 1,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Community name already exists** — `409 Conflict`
```json
{
  "success": false,
  "error": "Community with name 'Red Valley Residency' already exists",
  "errorCode": "COMMUNITY_ERROR"
}
```

**Tenant ID not found** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Tenant id not found",
  "errorCode": "COMMUNITY_ERROR"
}
```

----
## 🔄 Endpoint: Update Community

### ✅ Request Details

- **Type**: PATCH
- **URL**: `http://localhost:8080/community/1`
- **Request Name**: Update Community

### 📤 Request Body (JSON)
```json
{
  "name": "Green Valley Heights",
  "status": "INACTIVE"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Green Valley Heights",
    "status": "INACTIVE",
    "tenantId": 1,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-02T12:00:00Z"
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Community not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Community not found",
  "errorCode": "COMMUNITY_ERROR"
}
```

**Community name already exists** — `409 Conflict`
```json
{
  "success": false,
  "error": "Community with name 'Green Valley Heights' already exists",
  "errorCode": "COMMUNITY_ERROR"
}
```

----
## 🔄 Endpoint: Get Community

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/community/1`
- **Request Name**: Get Community

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Green Valley Heights",
    "status": "INACTIVE",
    "tenantId": 1,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-02T12:00:00Z"
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Community not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Community not found",
  "errorCode": "COMMUNITY_ERROR"
}
```

----
## 🔄 Endpoint: Get All Communities

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/community/all`
- **Request Name**: Get All Communities

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
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-02T12:00:00Z"
    },
    {
      "id": 2,
      "name": "Sunrise Apartments",
      "status": "ACTIVE",
      "tenantId": 1,
      "createdAt": "2024-01-03T09:00:00Z",
      "updatedAt": "2024-01-03T09:00:00Z"
    }
  ]
}
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Delete Community

### ✅ Request Details

- **Type**: DELETE
- **URL**: `http://localhost:8080/community/1`
- **Request Name**: Delete Community

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": null
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Community not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Community not found",
  "errorCode": "COMMUNITY_ERROR"
}
```

----
