# 📦 SocietyManagement API – Accounting Overview Controller

## 🔄 Endpoint: Get Accounting Overview

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/api/v1/accounting/overview`
- **Request Name**: Get Accounting Overview

### 📤 Query Parameters (Optional)

- **associationId** (Long)
- **from** (yyyy-MM-dd)
- **to** (yyyy-MM-dd)

> All query parameters are optional. If not provided, aggregated data for all records will be returned.

### ✅ Response Body (JSON) — Success
```json
{
  "success": true,
  "data": {
    "totalRevenue": 0,
    "totalExpenses": 0,
    "netIncome": 0,
    "outstanding": 0
  }
}