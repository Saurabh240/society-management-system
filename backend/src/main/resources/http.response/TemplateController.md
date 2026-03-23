# 📦 SocietyManagement API – Template Controller

## 🔄 Endpoint: Create Template

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/api/v1/communications/templates`
- **Request Name**: Create Template

### 📤 Request Body (JSON)
```json
{
  "name": "Payment Reminder",
  "level": "VENDOR",
  "category": "FINANCE",
  "subject": "Payment Due for {{associationName}}",
  "body": "Hello {{ownerName}}, Your HOA dues of {{amount}} are pending. Due date: {{dueDate}}. Thanks, {{associationName}}"
}
```



### ✅ Response Body (JSON) — Success
```json
{
  "id": 9,
  "name": "Payment Reminder",
  "level": "VENDOR",
  "category": "FINANCE",
  "lastModified": "2026-03-22T17:37:41.3089"
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

## 🔄 Endpoint: Resolve Template

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/api/v1/communications/templates`
- **Request Name**: Resolve Template

### 📤 Request Body (JSON)
```json
{
  "templateId": 9,
  "variables": {
    "ownerName": "John",
    "amount": "500",
    "dueDate": "2024-02-01",
    "associationName": "Sunrise HOA"
  }
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "subject": "Payment Due for Sunrise HOA",
  "body": "Hello John, Your HOA dues of 500 are pending. Due date: 2024-02-01. Thanks, Sunrise HOA"
}
```
- **Response Status**: 200 OK

