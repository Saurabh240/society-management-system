# 📘 HelpController(Support) API –  Testing Guide

## 🔄 Endpoint: Submit Support Ticket

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/help/support`
- **Request Name**: Submit Support Ticket
- ### 📤 Request Body (JSON)
```json
{
  "subject": "Unable to pay bill",
  "description": "When I click Pay on an overdue bill, I get an internal server error."
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 3,
    "subject": "Unable to pay bill",
    "description": "When I click Pay on an overdue bill, I get an internal server error.",
    "status": "OPEN",
    "createdAt": "2026-05-07T14:28:39.718717Z"
  }
}
```
- **Response Status**: 200 OK
- ----

## 🔄 Endpoint: Submit Feature Suggestion

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/help/suggestion`
- **Request Name**: Submit Feature Suggestion

### 📤 Request Body (JSON)
```
{
  "title": "Export Bills to PDF",
  "description": "It would be helpful to export the bills list as a PDF for record keeping."
}
```

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 3,
    "title": "Export Bills to PDF",
    "description": "It would be helpful to export the bills list as a PDF for record keeping.",
    "createdAt": "2026-05-07T14:36:28.631203500Z"
  }
}
```
- **Response Status**: 200 OK

----

