# 📦 SocietyManagement API – Owner Controller

## 🔄 Endpoint: Create Owner

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/owner`
- **Request Name**: Create Owner

### 📤 Request Body (JSON)
```json
{
  "unitId": 1,
  "associationId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "primaryStreet": "123 Main St",
  "primaryCity": "New York",
  "primaryState": "NY",
  "primaryZip": "10001",
  "altStreet": "456 Side St",
  "altCity": "New York",
  "altState": "NY",
  "altZip": "10002",
  "email": "john.doe@example.com",
  "altEmail": "john.alternate@example.com",
  "phone": "+1234567890",
  "altPhone": "+0987654321",
  "isBoardMember": false
}
```

> **Note:** unitId, associationId, firstName, lastName, primaryStreet, primaryCity, primaryState, primaryZip, email, and phone are required.

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "tenantId": 1,
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Invalid Input** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Invalid input",
  "errorCode": "OWNER_ERROR"
}
```

**Email Already Exists** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Owner with this email already exists",
  "errorCode": "OWNER_ERROR"
}
```

----
## 🔄 Endpoint: Update Owner

### ✅ Request Details

- **Type**: PATCH
- **URL**: `http://localhost:8080/owner/1`
- **Request Name**: Update Owner

### 📤 Request Body (JSON)
```json
{
  "firstName": "John Updated",
  "isBoardMember": true
}
```

> All fields are optional. Only provided fields will be updated.

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John Updated",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "tenantId": 1,
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Get Owner By ID

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/owner/1`
- **Request Name**: Get Owner By ID

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "primaryStreet": "123 Main St",
    "primaryCity": "New York",
    "primaryState": "NY",
    "primaryZip": "10001",
    "altStreet": "456 Side St",
    "altCity": "New York",
    "altState": "NY",
    "altZip": "10002",
    "email": "john.doe@example.com",
    "altEmail": "john.alternate@example.com",
    "phone": "+1234567890",
    "altPhone": "+0987654321",
    "tenantId": 1,
    "createdAt": "2024-01-01T10:00:00Z",
    "unitAssociations": [
      {
        "unitNumber": "101",
        "associationName": "Green Valley Residency",
        "isBoardMember": false,
        "termStartDate": null,
        "termEndDate": null
      }
    ]
  }
}
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Get Owner By ID, Unit, and Association

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/owner/1/unit/1/association/1`
- **Request Name**: Get Owner By ID, Unit, and Association

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "primaryStreet": "123 Main St",
    "primaryCity": "New York",
    "primaryState": "NY",
    "primaryZip": "10001",
    "altStreet": "456 Side St",
    "altCity": "New York",
    "altState": "NY",
    "altZip": "10002",
    "email": "john.doe@example.com",
    "altEmail": "john.alternate@example.com",
    "phone": "+1234567890",
    "altPhone": "+0987654321",
    "tenantId": 1,
    "createdAt": "2024-01-01T10:00:00Z",
    "unitNumber": "101",
    "associationName": "Green Valley Residency",
    "isBoardMember": false,
    "termStartDate": null,
    "termEndDate": null
  }
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Owner Not Found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Owner not found",
  "errorCode": "OWNER_ERROR"
}
```

**Owner Not Belong to Association** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Owner does not belong to this association",
  "errorCode": "OWNER_ERROR"
}
```

**Owner Not Linked to Unit** — `404 Not Found`
```json
{
  "success": false,
  "error": "Owner is not linked to this unit",
  "errorCode": "OWNER_ERROR"
}
```

----
## 🔄 Endpoint: Get All Owners by Tenant

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/owner/all`
- **Request Name**: Get All Owners by Tenant

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
    {
      "ownerId": 0,
      "firstName": "string",
      "lastName": "string",
      "associationId": 0,
      "associationName": "string",
      "unitId": 0,
      "unitNumber": "string",
      "email": "string",
      "phone": "string"
    }
  ]
}
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Get Owners by Unit

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/owner/unit/1`
- **Request Name**: Get Owners by Unit

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
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
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Get Board Members by Association

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/owner/board-members/1`
- **Request Name**: Get Board Members by Association

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": [
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
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Delete Owner

### ✅ Request Details

- **Type**: DELETE
- **URL**: `http://localhost:8080/owner/1`
- **Request Name**: Delete Owner

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": null
}
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Update Unit Owner Link

### ✅ Request Details

- **Type**: PATCH
- **URL**: `http://localhost:8080/owner/1/units/1`
- **Request Name**: Update Unit Owner Link

### 📤 Request Body (JSON)
```json
{
  "isBoardMember": true,
  "termStartDate": "2024-01-01T00:00:00Z",
  "termEndDate": "2024-12-31T23:59:59Z"
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": null
}
```
- **Response Status**: 200 OK

----
## 🔄 Endpoint: Remove Owner from Unit

### ✅ Request Details

- **Type**: DELETE
- **URL**: `http://localhost:8080/owner/1/units/1`
- **Request Name**: Remove Owner from Unit

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": null
}
```
- **Response Status**: 200 OK
