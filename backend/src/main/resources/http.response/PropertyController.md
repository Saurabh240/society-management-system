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

### 📤 Response Body (JSON)
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

### 📤 Response Body (JSON)
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
  },
}
```
- **Response Status**: 200 OK
----
## 🔄 Endpoint: Get Property

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/properties/1`
- **Request Name**: Get Property

### 📤 Response Body (JSON)
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
  },
}
```
- **Response Status**: 200 OK
----
## 🔄 Endpoint: Get All Properties

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/properties`
- **Request Name**: Get All Properties

### 📤 Response Body (JSON)
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
  ],
}
```
- **Response Status**: 200 OK
----
## 🔄 Endpoint: Get Properties by Community

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/properties/community/1`
- **Request Name**: Get Properties by Community

### 📤 Response Body (JSON)
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
  ],
}
```
- **Response Status**: 200 OK
----
## 🔄 Endpoint: Delete Property

### ✅ Request Details

- **Type**: DELETE
- **URL**: `http://localhost:8080/properties/1`
- **Request Name**: Delete Property

### 📤 Response Body (JSON)
```json
{
  "success": true,
  "data": null,
}
```
- **Response Status**: 200 OK
----
