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
  "associationId": 1,
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "occupancyStatus": "VACANT",
  "balance": 0
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
    "tenantId": 1,
    "associationId": 1,
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "occupancyStatus": "VACANT",
    "associationName": "AssociationName",
    "balance": 0,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": null,
    "unitOwners": []
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

**Association not found** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Association not found",
  "errorCode": "UNIT_ERROR"
}
```

**Property does not belong to same tenant** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Property does not belong to same tenant",
  "errorCode": "UNIT_ERROR"
}
```

**Unit number already exists in association** — `409 Conflict`
```json
{
  "success": false,
  "error": "Unit with number '101' already exists in association 'AssociationName'",
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
    "tenantId": 1,
    "associationId": 1,
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "occupancyStatus": "OCCUPIED",
    "associationName": "AssociationName",
    "balance": 0,
    "updatedAt": "2024-01-01T10:00:00Z",
    "unitOwners": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "tenantId": 1,
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ]
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
## 🔄 Endpoint: Get All Units by Association

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/units/association/1`
- **Request Name**: Get All Units by Association

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "unitNumber": "101",
      "tenantId": 1,
      "associationId": 1,
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "occupancyStatus": "OCCUPIED",
      "associationName": "AssociationName",
      "balance": 0,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z",
      "unitOwners": [
        "John Doe"
      ]
    },
    {
      "id": 2,
      "unitNumber": "102",
      "tenantId": 1,
      "associationId": 1,
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "occupancyStatus": "VACANT",
      "associationName": "AssociationName",
      "balance": 0,
      "createdAt": "2024-01-02T09:00:00Z",
      "updatedAt": "2024-01-02T09:00:00Z",
      "unitOwners": []
    }
  ]
}
```
- **Response Status**: 200 OK

> No specific error thrown — returns empty list if no units match the association and tenant.

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
      "tenantId": 1,
      "associationId": 1,
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "occupancyStatus": "OCCUPIED",
      "associationName": "AssociationName",
      "balance": 0,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z",
      "unitOwners": [
        "John Doe"
      ]
    },
    {
      "id": 2,
      "unitNumber": "102",
      "tenantId": 1,
      "associationId": 2,
      "street": "456 Oak St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94101",
      "occupancyStatus": "VACANT",
      "associationName": "OtherAssociation",
      "balance": 0,
      "createdAt": "2024-01-03T09:00:00Z",
      "updatedAt": "2024-01-03T09:00:00Z",
      "unitOwners": []
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
  "street": "123 New St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10002",
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
    "tenantId": 1,
    "associationId": 1,
    "street": "123 New St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002",
    "occupancyStatus": "OCCUPIED",
    "associationName": "AssociationName",
    "balance": 0,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-02T12:00:00Z",
    "unitOwners": [
      "John Doe"
    ]
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

**Unit number already exists in association** — `409 Conflict`
```json
{
  "success": false,
  "error": "Unit with number '103' already exists in association 'AssociationName'",
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
## 🔄 Endpoint: Update Unit Occupancy

### ✅ Request Details

- **Type**: PATCH
- **URL**: `http://localhost:8080/units/1/occupancy`
- **Request Name**: Update Unit Occupancy

### 📤 Request Body (JSON)
```json
{
  "occupancyStatus": "OCCUPIED"
}
```

> Only occupancyStatus is necessary to be updated. Only provided fields will be updated.

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "unitNumber": "103",
    "tenantId": 1,
    "associationId": 1,
    "street": "123 New St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002",
    "occupancyStatus": "OCCUPIED",
    "associationName": "AssociationName",
    "balance": 0,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-02T12:00:00Z",
    "unitOwners": [
      "John Doe"
    ]
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

**Occupancy status is already same** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Occupancy status is already same",
  "errorCode": "UNIT_ERROR"
}
```
