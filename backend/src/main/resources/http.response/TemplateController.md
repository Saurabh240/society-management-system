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
  "category": "Accounting",
  "description": "Template sent to new users upon registration",
  "recipientType": "BOARD_MEMBERS",
  "subject": "Payment Due for {{associationName}}",
  "body": "Hello {{ownerName}}, Your HOA dues of {{amount}} are pending. Due date: {{dueDate}}. Thanks, {{associationName}}",
  "content": "Please login using your credentials to get started."
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "id": 3,
  "tenantId": 0,
  "name": "Payment Reminder",
  "level": "VENDOR",
  "category": "Accounting",
  "description": "Template sent to new users upon registration",
  "recipientType": "BOARD_MEMBERS",
  "subject": "Payment Due for {{associationName}}",
  "body": "Hello {{ownerName}}, Your HOA dues of {{amount}} are pending. Due date: {{dueDate}}. Thanks, {{associationName}}",
  "content": "Please login using your credentials to get started.",
  "lastModified": "2026-03-31T17:11:47.3595092"
}
```
- **Response Status**: 200 OK
----
## 🔄 Endpoint: Get Template By Id

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/api/v1/communications/templates/7`
- **Request Name**: Get Tempalte By Id

### ✅ Response Body (JSON) — Success
```json
{
  "id": 3,
  "tenantId": 0,
  "name": "Payment Reminder",
  "level": "VENDOR",
  "category": "Accounting",
  "description": "Template sent to new users upon registration",
  "recipientType": "BOARD_MEMBERS",
  "subject": "Payment Due for {{associationName}}",
  "body": "Hello {{ownerName}}, Your HOA dues of {{amount}} are pending. Due date: {{dueDate}}. Thanks, {{associationName}}",
  "content": "Please login using your credentials to get started.",
  "lastModified": "2026-03-31T17:11:47.359509"
}
```
- **Response Status**: 200 OK



----
## 🔄 Endpoint: Update Template

### ✅ Request Details

- **Type**: PUT
- **URL**: `http://localhost:8080/api/v1/communications/templates/2`
- **Request Name**: Update Template

### 📤 Request Body (JSON)
```json
{
  "name": "Welcome Email Updated",
  "level": "VENDOR",
  "category": "Accounting",
  "description": "Updated description for welcome template",
  "recipientType": "BOARD_MEMBERS",
  "subject": "Welcome to our platform - Updated!",
  "body": "Hello {{name}}, welcome to {{platform}}. We are glad to have you!",
  "content": "Please login using your updated credentials to get started."
}
```
> All fields are optional. Only provided fields will be updated.

### ✅ Response Body (JSON) — Success
```json
{
  "id": 2,
  "tenantId": 0,
  "name": "Welcome Email Updated",
  "level": "VENDOR",
  "category": "Accounting",
  "description": "Updated description for welcome template",
  "recipientType": "BOARD_MEMBERS",
  "subject": "Welcome to our platform - Updated!",
  "body": "Hello {{name}}, welcome to {{platform}}. We are glad to have you!",
  "content": "Please login using your updated credentials to get started.",
  "lastModified": "2026-03-31T17:09:57.761605"
}
```
- **Response Status**: 200 OK

----

## 🔄 Endpoint: Get All Template

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/api/v1/communications/templates`
- **Request Name**: Get All Template
> **Get all template for dropdowm without page n size.
## How It Works with pagination and filter
```
GET /templates                        → all templates (dropdown)
GET /templates?level=VENDOR            → all templates filtered by level (dropdown)
GET /templates?page=0&size=10         → paginated
GET /templates?page=0&size=10&level=VENDOR → paginated + filtered

### ✅ Response Body (JSON) — Success
```json
[
  {
    "id": 1,
    "tenantId": 0,
    "name": "Payment Reminder",
    "level": "VENDOR",
    "category": "FINANCE",
    "description": "Template sent to new users upon registration",
    "recipientType": "TENANT_ADMIN",
    "subject": "Payment Due for {{associationName}}",
    "body": "Hello {{ownerName}}, Your HOA dues of {{amount}} are pending. Due date: {{dueDate}}. Thanks, {{associationName}}",
    "content": "Please login using your credentials to get started.",
    "lastModified": "2026-03-31T17:08:56.163106"
  },
  {
    "id": 3,
    "tenantId": 0,
    "name": "Payment Reminder",
    "level": "VENDOR",
    "category": "Accounting",
    "description": "Template sent to new users upon registration",
    "recipientType": "BOARD_MEMBERS",
    "subject": "Payment Due for {{associationName}}",
    "body": "Hello {{ownerName}}, Your HOA dues of {{amount}} are pending. Due date: {{dueDate}}. Thanks, {{associationName}}",
    "content": "Please login using your credentials to get started.",
    "lastModified": "2026-03-31T17:11:47.359509"
  },
  {
    "id": 2,
    "tenantId": 0,
    "name": "Welcome Email Updated",
    "level": "VENDOR",
    "category": "Accounting",
    "description": "Updated description for welcome template",
    "recipientType": "BOARD_MEMBERS",
    "subject": "Welcome to our platform - Updated!",
    "body": "Hello {{name}}, welcome to {{platform}}. We are glad to have you!",
    "content": "Please login using your updated credentials to get started.",
    "lastModified": "2026-03-31T17:09:57.761605"
  },
  {
    "id": 4,
    "tenantId": 0,
    "name": "Payment Reminder",
    "level": "VENDOR",
    "category": "Accounting",
    "description": "Template sent to new users upon registration",
    "recipientType": "BOARD_MEMBERS",
    "subject": "Payment Due for {{associationName}}",
    "body": "Hello {{ownerName}}, Your HOA dues of {{amount}} are pending. Due date: {{dueDate}}. Thanks, {{associationName}}",
    "content": "Please login using your credentials to get started.",
    "lastModified": "2026-03-31T17:32:53.525875"
  },
  {
    "id": 5,
    "tenantId": 0,
    "name": "Payment Reminder",
    "level": "VENDOR",
    "category": "Accounting",
    "description": "Template sent to new users upon registration",
    "recipientType": "BOARD_MEMBERS",
    "subject": "Payment Due for {{associationName}}",
    "body": "Hello {{ownerName}}, Your HOA dues of {{amount}} are pending. Due date: {{dueDate}}. Thanks, {{associationName}}",
    "content": "Please login using your credentials to get started.",
    "lastModified": "2026-03-31T17:32:56.528532"
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

