#📘 Journal Entries API – Testing Guide

# 🔄 Endpoint: Create Journal Entry

## ✅ Request Details

- **Type:** POST
- **URL:** `{{baseUrl}}/api/v1/accounting/journal-entries`

- **Request Name**: Create Journal
###📤 Request Body (JSON)
```json
{
"date": "2024-05-01",
"associationId": 1,
"memo": "Monthly maintenance expense",
"attachmentPath": "invoices/may-2024.pdf",
"lines": [
{
"accountId": 2,
"debit": 5000.00,
"credit": 0.00,
"description": "Maintenance expense"
},
{
"accountId": 1,
"debit": 0.00,
"credit": 5000.00,
"description": "Cash payment"
}
]
}
```

### ✅ Response Body (JSON) — Success
```json
{
"success": true,
"data": {
"id": 1,
"date": "2024-05-01",
"associationId": 1,
"memo": "Monthly maintenance expense",
"attachmentPath": "invoices/may-2024.pdf",
"lines": [
{
"accountId": 2,
"debit": 5000.00,
"credit": 0.00,
"description": "Maintenance expense"
},
{
"accountId": 1,
"debit": 0.00,
"credit": 5000.00,
"description": "Cash payment"
}
]
}
}
```

- **Response Status**: 201 CREATED
- ----

# Validation Rule (Important)

# ✔ Total Debit MUST equal Total Credit

```json
{
"success": false,
"error": "Total debit must equal total credit",
"errorCode": "VALIDATION_ERROR"
}
```


## 🔄 Endpoint: List Journal Entries

### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/accounting/journal-entries`
- **Request Name**: List Journal Entries

### ✅ Response Body (JSON) — Success

```json
{
"success": true,
"data": {
"content": [
{
"id": 1,
"date": "2024-05-01",
"associationId": 1,
"memo": "Monthly maintenance expense",
"attachmentPath": "invoices/may-2024.pdf",
"lines": [
{
"accountId": 2,
"debit": 5000.00,
"credit": 0.00,
"description": "Maintenance expense"
},
{
"accountId": 1,
"debit": 0.00,
"credit": 5000.00,
"description": "Cash payment"
}
]
}
],
"pageable": {
"pageNumber": 0,
"pageSize": 20
},
"totalPages": 1,
"totalElements": 1,
"last": true,
"first": true,
"numberOfElements": 1
}
}
```
- **Response Status**: 200 OK

----
##🔎 How Filtering Works
```

GET {{baseUrl}}/api/v1/accounting/journal-entries
→ Get All Entries (Basic)

GET {{baseUrl}}/api/v1/accounting/journal-entries?associationId=1
→ Filter by Association

GET {{baseUrl}}/api/v1/accounting/journal-entries?from=2024-01-01&to=2024-12-31
→ Date Range Filter

GET {{baseUrl}}/api/v1/accounting/journal-entries?associationId=1&from=2024-01-01&to=2024-12-31
→ Combined Filters
```


### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/accounting/journal-entries?associationId=1`
- **Request Name**: List Journal Entries By association Id

### ✅ Response Body (JSON) — Success

```json
       {
  "success": true,
  "data": {
    "content": [
      {
        "id": 2,
        "date": "2026-09-27",
        "associationId": 1,
        "memo": "Test deposit",
        "attachmentPath": null,
        "lines": [
          {
            "id": 3,
            "accountId": 23,
            "description": null,
            "debit": 100.00,
            "credit": 0.00
          },
          {
            "id": 4,
            "accountId": 17,
            "description": null,
            "debit": 0.00,
            "credit": 100.00
          }
        ]
      },
      {
        "id": 1,
        "date": "2026-09-22",
        "associationId": 1,
        "memo": "Invoice - Unit 101",
        "attachmentPath": null,
        "lines": [
          {
            "id": 1,
            "accountId": 5,
            "description": "Invoice - Unit 101",
            "debit": 200.00,
            "credit": 0.00
          },
          {
            "id": 2,
            "accountId": 14,
            "description": "Monthly HOA Fee",
            "debit": 0.00,
            "credit": 200.00
          }
        ]
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": {
        "empty": true,
        "sorted": false,
        "unsorted": true
      },
      "offset": 0,
      "unpaged": false,
      "paged": true
    },
    "last": true,
    "totalElements": 2,
    "totalPages": 1,
    "size": 20,
    "number": 0,
    "sort": {
      "empty": true,
      "sorted": false,
      "unsorted": true
    },
    "first": true,
    "numberOfElements": 2,
    "empty": false
  }
}
```
- **Response Status**: 200 OK

----