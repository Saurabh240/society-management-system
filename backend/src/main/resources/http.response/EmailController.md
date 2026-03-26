# 📦 SocietyManagement API – Communication Controller

## 🔄 Endpoint: Send Email

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/communications/emails`
- **Request Name**: Create Email

### 📤 Request Body (JSON)
```json
{
  "body": "Test Email",
  "channel": "EMAIL",
  "recipient": {
    "type": "ALL_RESIDENTS",
    "ownerId": 1,
    "associationId": 1
  },
  "subject": "Test Email",
  "tenantId": 0,
  "associationId": 1,
  "templateId": 1,
  "scheduledAt": "1948-01-27T09:15:19.098Z"
}
```
> **Channel** allowed values: `EMAIL`, `SMS`, `MAILING`
> **Recipient Type** allowed values: `ALL_OWNERS`, `ALL_RESIDENTS`, `BOARD_MEMBERS`, `OWNER`
### ✅ Response Body (JSON) — Success
```json
1
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Channel Type Empty** — `400 Bad Request`
```json
{
  "success": false,
  "error": "channel: Channel is required",
  "errorCode": "VALIDATION_ERROR"
}
```
----
## 🔄 Endpoint: Edit Email

### ✅ Request Details

- **Type**: PUT
- **URL**: `{{baseUrl}}/api/v1/communications/emails/:id`
- **Request Name**: Edit Email

### 📤 Request Body (JSON)
```json
{
  "body": "New Test Email",
  "subject": "New Test Email",
  "scheduledAt": "2026-03-22T12:27:00.033Z",
  "templateId": 1
}
```
> Note: All fields are optional for the update request.

### ✅ Response Body (JSON) — Success
>Empty 

- **Response Status**: 204 No Content

### ❌ Error Responses

**Template not found** — `404 Not Found`
```json
{
  "success": false,
  "error": "Template not found",
  "errorCode": "TEMPLATE_ERROR"
}
```
----
## 🔄 Endpoint: List Emails

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/communications/emails?tenantId=0&page=0&size=10`
- **Request Name**: List Emails

### ✅ Response Body (JSON) — Success
```json
{
  "content": [
    {
      "id": 5,
      "subject": "Test Email 1",
      "recipientLabel": "ALL_RESIDENTS",
      "date": "1948-01-27T09:15:19.098Z",
      "status": "SCHEDULED",
      "channel": "EMAIL"
    },
    {
      "id": 4,
      "subject": "Test Email 1",
      "recipientLabel": "ALL_RESIDENTS",
      "date": "1948-01-27T09:15:19.098Z",
      "status": "SCHEDULED",
      "channel": "EMAIL"
    },
    {
      "id": 3,
      "subject": "Test Email",
      "recipientLabel": "ALL_RESIDENTS",
      "date": "1948-01-27T09:15:19.098Z",
      "status": "SCHEDULED",
      "channel": "EMAIL"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "last": true,
  "totalPages": 1,
  "totalElements": 3,
  "size": 10,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "first": true,
  "numberOfElements": 3,
  "empty": false
}
```
- **Response Status**: 200 OK

### ❌ Error Responses

**Tenant ID not found** — `400 Bad Request`
```json
{
  "success": false,
  "error": "Tenant id not found",
  "errorCode": "EMAIL_ERROR"
}
```
----
## 🔄 Endpoint: View Email

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/communications/emails/:id`
- **Request Name**: View Email

### 📤 Request Param (ID)
id: 1

```
> Note: All fields are optional for the update request.

### ✅ Response Body (JSON) — Success

```json
{
    "id": 4,
    "subject": "Test Email 1",
    "body": "Test Email 1",
    "recipientLabel": "ALL_RESIDENTS",
    "sentAt": null,
    "scheduledAt": "2026-11-15T13:20:07.210Z",
    "createdAt": "2026-03-21T10:56:03.747716Z",
    "status": "SCHEDULED",
    "channel": "EMAIL",
    "templateId": 1
}
```

- **Response Status**: 200 OK

----
## 🔄 Endpoint: Resend Email

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/communications/emails/:id/resend`
- **Request Name**: Resend Email

### ✅ Response Body (JSON) — Success

- **Response Status**: 204 No Content

----
## 🔄 Endpoint: Reschedule Email

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/communications/emails/:id/reschedule`
- **Request Name**: Reschedule Email

### ✅ Response Body (JSON) — Success

- **Response Status**: 204 No Content

----
## 🔄 Endpoint: Delete Email

### ✅ Request Details

- **Type**: DELETE
- **URL**: `{{baseUrl}}/api/v1/communications/emails/:id`
- **Request Name**: Delete Email

### ✅ Response Body (JSON) — Success

- **Response Status**: 204 No Content
----
