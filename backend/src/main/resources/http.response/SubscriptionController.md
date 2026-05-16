# 📘 Subscription API –  Testing Guide

## 🔄 Endpoint: Create subscription

### ✅ Request Details

- **Type**: POST
- **URL**: `  http://localhost:8080/subscription?tenantId=0&unitLimit=200&status=ACTIVE&planName=Professional&nextBillingDate=2026-03-15`
- **Request Name**: Create Subscription

### ✅ Response Body (JSON) — Success
```json
{
  "id": 2,
  "tenantId": 0,
  "unitLimit": 200,
  "status": "ACTIVE",
  "planName": "Professional",
  "nextBillingDate": "2026-03-15",
  "unitsUsed": 1
}
```
- **Response Status**: 200 OK
- ----

## 🔄 Endpoint: Get Subscription

### ✅ Request Details

- **Type**: GET
- **URL**: ` http://localhost:8080/subscription`
- **Request Name**: Get subscription

### ✅ Response Body (JSON) — Success
```json
{
  "id": 2,
  "tenantId": 0,
  "unitLimit": 200,
  "status": "ACTIVE",
  "planName": "Professional",
  "nextBillingDate": "2026-03-15",
  "unitsUsed": 1
}
```
- **Response Status**: 200 OK
- ----