# 📦 SocietyManagement API – SMS Controller

## 🔄 Endpoint: Create SMS

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/api/v1/communications/sms`
- **Request Name**: Create SMS

### 📤 Request Body (JSON)
```json
{
  "associationId": 1,
  "subject": "HOA Meeting",
  "body": "Reminder: HOA meeting tomorrow at 6 PM",
  "channel": "SMS",
  "recipient": {
    "type": "ALL_OWNERS"
  },
  "scheduledAt": "2026-04-01T10:00:00Z"
}
```

### ✅ Response Body (JSON) — Success
```json
1
```
- **Response Status**: 200 OK



----
## 🔄 Endpoint:  List Sms

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/api/v1/communications/sms`
- **Request Name**: Get All sms



### ✅ Response Body (JSON) — Success
```json
[
  {
    "id": 4,
    "message": "Reminder: HOA meeting tomorrow at 6 PM",
    "recipient": "Recipients",
    "phoneNumbers": [
      "+911234567890"
    ],
    "date": "2026-03-23T17:42:42.421957Z",
    "status": "SENT"
  },
  {
    "id": 3,
    "message": "Reminder: HOA meeting tomorrow at 6 PM",
    "recipient": "Recipients",
    "phoneNumbers": [
      "+911234567890"
    ],
    "date": "2026-03-23T17:42:24.503063Z",
    "status": "SENT"
  },
  {
    "id": 2,
    "message": "Reminder: HOA meeting tomorrow at 6 PM",
    "recipient": "Recipients",
    "phoneNumbers": [
      "+911234567890"
    ],
    "date": "2026-03-23T17:42:05.246541Z",
    "status": "SENT"
  },
  {
    "id": 1,
    "message": "Reminder: HOA meeting tomorrow at 6 PM",
    "recipient": "Recipients",
    "phoneNumbers": [
      "+911234567890"
    ],
    "date": "2026-03-23T17:36:57.656701Z",
    "status": "SENT"
  }

```
- **Response Status**: 200 OK

----

## 🔄 Endpoint: Resend Sms

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/api/v1/communications/templates?level=ASSOCIATION`
- **Request Name**:Resend Sms

### ✅ Response Body (JSON) — Success
```json
{
  "message": "SMS resent successfully"
}
```
- **Response Status**: 200 OK

----

## 🔄 Endpoint: Reschedule Sms

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/api/v1/communications/sms/5/reschedule`
- **Request Name**: Reschedule Sms
- ### ✅ Response Body (JSON) — Success
```json
{
  "id": 5,
  "message": "Reminder: HOA meeting tomorrow at 6 PM",
  "recipient": "Recipients",
  "phoneNumbers": [
    "+911234567890"
  ],
  "date": "2026-04-01T10:00:00Z",
  "status": "SCHEDULED"
}
```
- **Response Status**: 200 OK


----

## 🔄 Endpoint: Delete Sms

### ✅ Request Details

- **Type**: DELETE Sms
- **URL**: `http://localhost:8080/api/v1/communications/sms/1`
- **Request Name**: Delete sms by id

- **Response Status**: 200 OK
----
## 🔄 Endpoint: Delete all Template by Id

### ✅ Request Details

- **Type**: DELETE All Sms By Id
- **URL**: `http://localhost:8080/api/v1/communications/sms/batch`
- **Request Name**: Delete all Sms by id

### ✅ Response Body (JSON) — Success
```json
[2,3,4]
```
- **Response Status**: 200 OK




