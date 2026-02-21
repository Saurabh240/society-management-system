# 📦 SocietyManagement API – Unit Controller

## 🔄 Endpoint: Create Unit

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/units`
- **Request Name**: Create Unit

### 📤 Request Body (JSON)
```json
{
  "unitNumber": "101",
  "propertyId": 1,
  "occupancyStatus": "VACANT"
}
```

> **OccupancyStatus** allowed values: `OCCUPIED`, `VACANT`

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "unitNumber": "101",
    "propertyId": 1,
    "tenantId": 1,
    "occupancyStatus": "VACANT",
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
  "errorCode": "UNIT_ERROR"
}
```

**Property not found** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Property not found",
  "errorCode": "PROPERTY_ERROR"
}
```

**Property does not belong to same tenant** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Property does not belong to same tenant",
  "errorCode": "PROPERTY_ERROR"
}
```

**Unit number already exists in property** — `409 Conflict`
```json
{
  "success": false,
  "error": "Unit with number '101' already exists in property '1'",
  "errorCode": "UNIT_ERROR"
}
```

----
## 🔄 Endpoint: Get Unit

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/units/1`
- **Request Name**: Get Unit

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "unitNumber": "101",
    "propertyId": 1,
    "tenantId": 1,
    "occupancyStatus": "OCCUPIED",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Unit not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Unit not found",
  "errorCode": "UNIT_ERROR"
}
```

**Unit does not belong to same tenant** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Unit does not belong to same tenant",
  "errorCode": "UNIT_ERROR"
}
```

----
## 🔄 Endpoint: Get All Units by Property

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/units/property/1`
- **Request Name**: Get All Units by Property

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "unitNumber": "101",
      "propertyId": 1,
      "tenantId": 1,
      "occupancyStatus": "OCCUPIED",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "unitNumber": "102",
      "propertyId": 1,
      "tenantId": 1,
      "occupancyStatus": "VACANT",
      "createdAt": "2024-01-02T09:00:00Z",
      "updatedAt": "2024-01-02T09:00:00Z"
    }
  ]
}
```
- **Response Status**: 200 OK

> No specific error thrown — returns empty list if no units match the property and tenant.

----
## 🔄 Endpoint: Get All Units by Tenant

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/units`
- **Request Name**: Get All Units by Tenant

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "unitNumber": "101",
      "propertyId": 1,
      "tenantId": 1,
      "occupancyStatus": "OCCUPIED",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "unitNumber": "102",
      "propertyId": 2,
      "tenantId": 1,
      "occupancyStatus": "VACANT",
      "createdAt": "2024-01-03T09:00:00Z",
      "updatedAt": "2024-01-03T09:00:00Z"
    }
  ]
}
```
- **Response Status**: 200 OK

> No specific error thrown — returns empty list if no units match the tenant.

----
## 🔄 Endpoint: Update Unit

### ✅ Request Details

- **Type**: PATCH
- **URL**: `http://localhost:8080/units/1`
- **Request Name**: Update Unit

### 📤 Request Body (JSON)
```json
{
  "unitNumber": "103",
  "occupancyStatus": "OCCUPIED"
}
```

> All fields are optional. Only provided fields will be updated.

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "unitNumber": "103",
    "propertyId": 1,
    "tenantId": 1,
    "occupancyStatus": "OCCUPIED",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-02T12:00:00Z"
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Unit not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Unit not found",
  "errorCode": "UNIT_ERROR"
}
```

**Unit does not belong to same tenant** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Unit does not belong to same tenant",
  "errorCode": "UNIT_ERROR"
}
```

**Unit number already exists in property** — `409 Conflict`
```json
{
  "success": false,
  "error": "Unit with number '103' already exists in property '1'",
  "errorCode": "UNIT_ERROR"
}
```

----
## 🔄 Endpoint: Delete Unit

### ✅ Request Details

- **Type**: DELETE
- **URL**: `http://localhost:8080/units/1`
- **Request Name**: Delete Unit

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": null
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Unit not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Unit not found",
  "errorCode": "UNIT_ERROR"
}
```

**Unit does not belong to same tenant** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Unit does not belong to same tenant",
  "errorCode": "UNIT_ERROR"
}
```

----
