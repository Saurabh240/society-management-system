# 📦 SocietyManagement API – Template Controller

## 🔄 Endpoint: Create Template

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/api/v1/communications/templates`
- **Request Name**: Create Template

### 📤 Request Body (JSON)
```json
{
  "tenantId": 1,
  "name": "Association Payment Confirmation",
  "level": "ASSOCIATION",
  "category": "Accounting",
  "subject": "Payment confirmation",
  "body": "Payment processed successfully"
}
```



### ✅ Response Body (JSON) — Success
```json
{
  "id": 1,
  "name": "Association Payment Confirmation",
  "level": "ASSOCIATION",
  "category": "Accounting",
  "lastModified": "2026-03-20T00:28:26.5724408"
}
```
- **Response Status**: 200 OK



----
## 🔄 Endpoint: Update Template

### ✅ Request Details

- **Type**: PUT
- **URL**: `http://localhost:8080/api/v1/communications/templates/6`
- **Request Name**: Update Template

### 📤 Request Body (JSON)
```json
{
  "name": "Updated Template",
  "level": "VENDOR",
  "category": "Accounting",
  "subject": "Updated Subject",
  "body": "Updated body content"
}
```

> All fields are optional. Only provided fields will be updated.

### ✅ Response Body (JSON) — Success
```json
{
  "id": 6,
  "name": "Updated Template",
  "level": "VENDOR",
  "category": "Accounting",
  "lastModified": "2026-03-20T00:28:23.177601"
}
```
- **Response Status**: 200 OK

----

## 🔄 Endpoint: Get All Template

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/api/v1/communications/templates?level=ASSOCIATION`
- **Request Name**: Get All Template

### ✅ Response Body (JSON) — Success
```json
[
  {
    "id": 7,
    "name": "Association Payment Confirmation",
    "level": "ASSOCIATION",
    "category": "Accounting",
    "lastModified": "2026-03-20T00:28:25.258404"
  },
  {
    "id": 8,
    "name": "Association Payment Confirmation",
    "level": "ASSOCIATION",
    "category": "Accounting",
    "lastModified": "2026-03-20T00:28:26.572441"
  }
]
```
- **Response Status**: 200 OK

----

## 🔄 Endpoint: Delete Template By Id

### ✅ Request Details

- **Type**: DELETE
- **URL**: `http://localhost:8080/api/v1/communications/templates/1`
- **Request Name**: Delete Template by id

- **Response Status**: 200 OK

----

## 🔄 Endpoint: Delete all Template by Id

### ✅ Request Details

- **Type**: DELETE All Template By Id
- **URL**: `http://localhost:8080/api/v1/communications/templates/batch`
- **Request Name**: Delete all template by id

### ✅ Response Body (JSON) — Success
```json
[4, 5]
```
- **Response Status**: 200 OK
