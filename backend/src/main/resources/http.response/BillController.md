# 📦 SocietyManagement API – Bill Controller

## 🔄 Endpoint: Create Bill

### ✅ Request Details
 
- **Type**: POST
- **URL**: `http://localhost:8080/api/v1/accounting/bills`
- **Request Name**: Create Bill

### 📤 Request Body (JSON)
```json
{
"billNumber": "",
"vendorId": 10,
"associationId": 1,
"issueDate": "2026-04-01",
"dueDate": "2026-04-15",
"memo": "April landscaping services",
"lineItems": [
{
"description": "Garden maintenance",
"expenseAccountId": 5001,
"amount": 500.00
},
{
"description": "Tree trimming",
"expenseAccountId": 5002,
"amount": 300.00
}
]
}
```



### ✅ Response Body (JSON) — Success
```json
{
"id": 1,
"billNumber": "BILL-001",
"vendorId": 10,
"associationId": 1,
"issueDate": "2026-04-01",
"dueDate": "2026-04-15",
"status": "UNPAID",
"totalAmount": 800.00,
"memo": "April landscaping services",
"paidAt": null
}
```

- **Response Status**: 200 OK

## 🔄 Endpoint: Get / Filter Bills

### ✅ Request Details
- **Type**: GET
- **URL**:
`http://localhost:8080/api/v1/accounting/bills?associationId=1&status=UNPAID&from=2026-04-01&to=2026-04-30&page=0&size=10`
- **Request Name**: Get Bills

### ✅ Response Body (JSON) — Success

```json
{
"content": [
{
"id": 1,
"billNumber": "BILL-001",
"vendorId": 10,
"associationId": 1,
"issueDate": "2026-04-01",
"dueDate": "2026-04-15",
"status": "UNPAID",
"totalAmount": 800.00,
"memo": "April landscaping services",
"paidAt": null
}
],
"totalElements": 1,
"totalPages": 1,
"size": 10,
"number": 0
}
```

- **Response Status**: 200 OK

## 🔄 Endpoint: Update Bill

### ✅ Request Details

- **Type**: PUT
- **URL**: `http://localhost:8080/api/v1/accounting/bills/1`
- **Request Name**: Update Bill

### 📤 Request Body (JSON)
```json
{
"vendorId": 10,
"associationId": 1,
"issueDate": "2026-04-01",
"dueDate": "2026-04-20",
"memo": "Updated April landscaping services",
"lineItems": [
{
"description": "Garden maintenance",
"expenseAccountId": 5001,
"amount": 600.00
}
]
}
```


### ✅ Response Body (JSON) — Success
```json
{
"id": 1,
"billNumber": "BILL-001",
"vendorId": 10,
"associationId": 1,
"issueDate": "2026-04-01",
"dueDate": "2026-04-20",
"status": "UNPAID",
"totalAmount": 600.00,
"memo": "Updated April landscaping services",
"paidAt": null
}
```
- **Response Status**: 200 OK

## 🔄 Endpoint: Delete Bill

### ✅ Request Details
- **Type**: DELETE
- **URL**: `http://localhost:8080/api/v1/accounting/bills/1`
- **Request Name**: Delete Bill

# ✅ Response
- **Response Status**:  204 No Content


## 🔄 Endpoint: Pay Bill

### ✅ Request Details
- **Type**:  POST
- **URL**: `http://localhost:8080/api/v1/accounting/bills/1/pay`
- **Request Name**: Pay Bill

### 📤 Request Body (JSON)
```json
{
"bankAccountId": 200,
"paymentDate": "2026-04-18"
}
```


### ✅ Response Body (JSON) — Success

```json
{
"id": 1,
"billNumber": "BILL-001",
"vendorId": 10,
"associationId": 1,
"issueDate": "2026-04-01",
"dueDate": "2026-04-15",
"status": "PAID",
"totalAmount": 800.00,
"memo": "April landscaping services",
"paidAt": "2026-04-18T10:15:30Z"
}
```

- **Response Status**: 200 OK

- **⏰ Automatic Overdue Handling**

# Bills are automatically marked as OVERDUE when:

- **dueDate < today**
- **status = UNPAID**

- **This is handled by a scheduled job running every 60 seconds.**

## 🔄 Endpoint:  Bill Summary

### ✅ Request Details
- **Type**:  GET
- **URL**: `http://localhost:8080/api/v1/accounting/bills//summary`
- **Request Name**: Bill Summary

### ✅ Response Body (JSON) — Success

```json
{
  "totalBills": 12,
  "totalAmount": 45000.00,
  "unpaidAmount": 12000.00,
  "overdueAmount": 5000.00
}
```

- **Response Status**: 200 OK
# Bill Attachments

## 🔄 Endpoint: Upload Bill Attachments
**Prerequisites**
- App is running with a valid bill in DB — Bill ID: 1 (must exist in DB)
- Have a PDF, PNG, and JPG file ready on your machine

### ✅ Request Details

- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/accounting/bills/1/attachments`
- **Request Name**: Upload Attachment

### 📤 Request Body (JSON)
- **Body tab** → select form-data
- **Add a key named** → file, **change type dropdown from** → Text to File
- **Select your file**

### ✅ Response Body (JSON) — Success
```json
{
  "id": 1,
  "billId": 1,
  "originalFilename": "gerd-23.pdf",
  "contentType": "application/pdf",
  "fileSize": 125561,
  "fileSizeFormatted": "122.6 KB",
  "createdAt": "2026-04-21T05:36:12.027528Z"
}
```
- Expected: 201 Created
## 🔄 Endpoint: List Bill Attachments
### ✅ Request Details

- **Type**: GET
- **URL**: `{{baseUrl}}/api/v1/accounting/bills/1/attachments`
- **Request Name**: List Attachments
### ✅ Response Body (JSON) — Success
```json
[
    {
        "id": 1,
        "billId": 1,
        "originalFilename": "gerd-23.pdf",
        "contentType": "application/pdf",
        "fileSize": 125561,
        "fileSizeFormatted": "122.6 KB",
        "createdAt": "2026-04-21T05:36:12.027528Z"
    }
]
```
- Expected: 200 OK