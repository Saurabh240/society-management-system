# 📦 SocietyManagement API – Financial Reports

---

# 📊 Endpoint: Balance Sheet Report

### ✅ Request Details

- **Type:** GET
- **URL:** `http://localhost:8080/api/v1/finance/reports/balance-sheet`

---

## 📤 Query Parameters

| Parameter | Type | Required | Default |
|------------|--------|-----------|-----------|
| associationId | Long | ❌ | All Associations |
| asOfDate | yyyy-MM-dd | ❌ | Today |
| accountingBasis | CASH / ACCRUAL | ❌ | ACCRUAL |

---

## Example 1 — No Filters

### Request

```http
GET /api/v1/finance/reports/balance-sheet
```

### Response

```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-06-04",
    "accountingBasis": "ACCRUAL",
    "totalAssets": 15000.00,
    "totalLiabilities": 5000.00,
    "totalEquity": 10000.00,
    "totalLiabilitiesAndEquity": 15000.00,
    "isBalanced": true,
    "assets": [
      {
        "accountCode": "1010",
        "accountName": "Cash",
        "balance": 15000.00
      }
    ],
    "liabilities": [
      {
        "accountCode": "2010",
        "accountName": "Payables",
        "balance": 5000.00
      }
    ],
    "equity": [
      {
        "accountCode": "3010",
        "accountName": "Retained Earnings",
        "balance": 10000.00
      }
    ]
  }
}
```

---

## Example 2 — Association Filter

### Request

```http
GET /api/v1/finance/reports/balance-sheet?associationId=1
```

### Response

```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-06-04",
    "accountingBasis": "ACCRUAL",
    "totalAssets": 10000.00,
    "totalLiabilities": 3000.00,
    "totalEquity": 7000.00,
    "totalLiabilitiesAndEquity": 10000.00,
    "isBalanced": true,
    "assets": [],
    "liabilities": [],
    "equity": []
  }
}
```

---

## Example 3 — CASH Basis

### Request

```http
GET /api/v1/finance/reports/balance-sheet?accountingBasis=CASH
```

### Response

```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-06-04",
    "accountingBasis": "CASH",
    "totalAssets": 12000.00,
    "totalLiabilities": 2000.00,
    "totalEquity": 10000.00,
    "totalLiabilitiesAndEquity": 12000.00,
    "isBalanced": true,
    "assets": [],
    "liabilities": [],
    "equity": []
  }
}
```

---

## Example 4 — Historical Date

### Request

```http
GET /api/v1/finance/reports/balance-sheet?asOfDate=2025-12-31
```

### Response

```json
{
  "success": true,
  "data": {
    "asOfDate": "2025-12-31",
    "accountingBasis": "ACCRUAL",
    "totalAssets": 8500.00,
    "totalLiabilities": 2500.00,
    "totalEquity": 6000.00,
    "totalLiabilitiesAndEquity": 8500.00,
    "isBalanced": true,
    "assets": [],
    "liabilities": [],
    "equity": []
  }
}
```

---

## Example 5 — No Data Found

### Request

```http
GET /api/v1/finance/reports/balance-sheet?associationId=999
```

### Response

```json
{
  "success": true,
  "data": {
    "asOfDate": "2026-06-04",
    "accountingBasis": "ACCRUAL",
    "totalAssets": 0,
    "totalLiabilities": 0,
    "totalEquity": 0,
    "totalLiabilitiesAndEquity": 0,
    "isBalanced": true,
    "assets": [],
    "liabilities": [],
    "equity": []
  }
}
```

---

# 📈 Endpoint: Income Statement Report

### ✅ Request Details

- **Type:** GET
- **URL:** `http://localhost:8080/api/v1/finance/reports/income-statement`

---

## 📤 Query Parameters

| Parameter | Type | Required | Default |
|------------|--------|-----------|-----------|
| associationId | Long | ❌ | All |
| dateRange | THIS_QUARTER / THIS_YEAR / LAST_YEAR / CUSTOM | ❌ | CUSTOM |
| from | yyyy-MM-dd | ❌ | null |
| to | yyyy-MM-dd | ❌ | null |
| accountingBasis | CASH / ACCRUAL | ❌ | ACCRUAL |
| accountSelection | ALL / INCOME_ONLY / EXPENSE_ONLY | ❌ | ALL |

---

## Example 1 — No Filters

### Request

```http
GET /api/v1/finance/reports/income-statement
```

### Response

```json
{
  "success": true,
  "data": {
    "from": null,
    "to": null,
    "accountingBasis": "ACCRUAL",
    "totalRevenue": 5000.00,
    "totalExpenses": 2500.00,
    "netIncome": 2500.00,
    "revenue": [],
    "expenses": []
  }
}
```

---

## Example 2 — THIS_YEAR

### Request

```http
GET /api/v1/finance/reports/income-statement?dateRange=THIS_YEAR
```

### Response

```json
{
  "success": true,
  "data": {
    "from": "2026-01-01",
    "to": "2026-06-04",
    "accountingBasis": "ACCRUAL",
    "totalRevenue": 5000.00,
    "totalExpenses": 2500.00,
    "netIncome": 2500.00,
    "revenue": [],
    "expenses": []
  }
}
```

---

## Example 3 — Custom Date Range

### Request

```http
GET /api/v1/finance/reports/income-statement?dateRange=CUSTOM&from=2026-01-01&to=2026-03-31
```

### Response

```json
{
  "success": true,
  "data": {
    "from": "2026-01-01",
    "to": "2026-03-31",
    "accountingBasis": "ACCRUAL",
    "totalRevenue": 3500.00,
    "totalExpenses": 1500.00,
    "netIncome": 2000.00,
    "revenue": [],
    "expenses": []
  }
}
```

---

## Example 4 — INCOME_ONLY

### Request

```http
GET /api/v1/finance/reports/income-statement?accountSelection=INCOME_ONLY
```

### Response

```json
{
  "success": true,
  "data": {
    "from": null,
    "to": null,
    "accountingBasis": "ACCRUAL",
    "totalRevenue": 5000.00,
    "totalExpenses": 2500.00,
    "netIncome": 2500.00,
    "revenue": [
      {
        "accountCode": "4010",
        "accountName": "Maintenance Revenue",
        "balance": 5000.00
      }
    ],
    "expenses": []
  }
}
```

---

## Example 5 — EXPENSE_ONLY

### Request

```http
GET /api/v1/finance/reports/income-statement?accountSelection=EXPENSE_ONLY
```

### Response

```json
{
  "success": true,
  "data": {
    "from": null,
    "to": null,
    "accountingBasis": "ACCRUAL",
    "totalRevenue": 5000.00,
    "totalExpenses": 2500.00,
    "netIncome": 2500.00,
    "revenue": [],
    "expenses": [
      {
        "accountCode": "5010",
        "accountName": "Electricity Expense",
        "balance": 2500.00
      }
    ]
  }
}
```

---

## Example 6 — CASH Basis

### Request

```http
GET /api/v1/finance/reports/income-statement?accountingBasis=CASH
```

### Response

```json
{
  "success": true,
  "data": {
    "from": null,
    "to": null,
    "accountingBasis": "CASH",
    "totalRevenue": 4200.00,
    "totalExpenses": 1800.00,
    "netIncome": 2400.00,
    "revenue": [],
    "expenses": []
  }
}
```

---

# 📑 Endpoint: Trial Balance Report

### ✅ Request Details

- **Type:** GET
- **URL:** `http://localhost:8080/api/v1/finance/reports/trial-balance`

---

## 📤 Query Parameters

| Parameter | Type |
|------------|---------|
| associationId | Long |
| dateRange | THIS_QUARTER / LAST_QUARTER / THIS_YEAR / CUSTOM |
| from | yyyy-MM-dd |
| to | yyyy-MM-dd |
| accountingBasis | CASH / ACCRUAL |

---

## Example 1 — No Filters

### Request

```http
GET /api/v1/finance/reports/trial-balance
```

### Response

```json
{
  "success": true,
  "data": {
    "from": null,
    "to": null,
    "totalDebits": 10000.00,
    "totalCredits": 10000.00,
    "isBalanced": true,
    "accounts": [
      {
        "accountCode": "1010",
        "accountName": "Cash",
        "accountType": "ASSETS",
        "totalDebit": 10000.00,
        "totalCredit": 0,
        "balance": 10000.00
      }
    ]
  }
}
```

---

## Example 2 — THIS_QUARTER

### Request

```http
GET /api/v1/finance/reports/trial-balance?dateRange=THIS_QUARTER
```

### Response

```json
{
  "success": true,
  "data": {
    "from": "2026-04-01",
    "to": "2026-06-04",
    "totalDebits": 5000.00,
    "totalCredits": 5000.00,
    "isBalanced": true,
    "accounts": []
  }
}
```

---

## Example 3 — LAST_QUARTER

### Request

```http
GET /api/v1/finance/reports/trial-balance?dateRange=LAST_QUARTER
```

### Response

```json
{
  "success": true,
  "data": {
    "from": "2026-01-01",
    "to": "2026-03-31",
    "totalDebits": 4000.00,
    "totalCredits": 4000.00,
    "isBalanced": true,
    "accounts": []
  }
}
```

---

## Example 4 — CASH Basis

### Request

```http
GET /api/v1/finance/reports/trial-balance?accountingBasis=CASH
```

### Response

```json
{
  "success": true,
  "data": {
    "from": null,
    "to": null,
    "totalDebits": 6000.00,
    "totalCredits": 6000.00,
    "isBalanced": true,
    "accounts": []
  }
}
```

---

## Example 5 — Association Filter

### Request

```http
GET /api/v1/finance/reports/trial-balance?associationId=1
```

### Response

```json
{
  "success": true,
  "data": {
    "from": null,
    "to": null,
    "totalDebits": 3000.00,
    "totalCredits": 3000.00,
    "isBalanced": true,
    "accounts": []
  }
}
```

# 📊 Endpoint:Vendor Ledger Report

### ✅ Request Details

- **Type:** GET
- **URL:** `http://localhost:8080/api/v1/finance/reports/vendor-ledger`

---

## 📤 Query Parameters

| Parameter        | Type                                          | Required | Default            |
|------------------|-----------------------------------------------|-----------|--------------------|
| associationId    | Long                                          | ❌ | All                |
| dateRange        | THIS_QUARTER / THIS_YEAR / LAST_YEAR / CUSTOM | ❌ | THIS_YEAR          |
| from             | yyyy-MM-dd                                    | ❌ | start date of year |
| to               | yyyy-MM-dd                                    | ❌ | Current date       |
| vendorId         | Long                                          | ❌ | All                |

---

## Example 1 — No Filters
# Request
`http GET /api/v1/finance/reports/vendor-ledger`
# Response
```json
{
"success": true,
"data": {
"from": "2026-01-01",
"to": "2026-06-06",
"vendors": [
{
"vendorId": 4,
"vendorName": "John Doe (ABC Plumbing)",
"serviceCategory": "Maintenance",
"openingBalance": 500.00,
"totalBilled": 700.00,
"totalPaid": 200.00,
"closingBalance": 1000.00,
"transactions": [
{
"date": "2024-01-05",
"billNumber": "BILL-002",
"description": "Pipe repair",
"amount": 200.00,
"status": "PAID",
"runningBalance": 700.00
},
{
"date": "2024-01-05",
"billNumber": "BILL-002",
"description": "Payment - BILL-002",
"amount": -200.00,
"status": "PAID",
"runningBalance": 500.00
},
{
"date": "2024-02-10",
"billNumber": "BILL-003",
"description": "Water heater installation",
"amount": 350.00,
"status": "UNPAID",
"runningBalance": 850.00
},
{
"date": "2024-03-01",
"billNumber": "BILL-004",
"description": "Emergency pipe fix",
"amount": 150.00,
"status": "OVERDUE",
"runningBalance": 1000.00
}
]
},
{
"vendorId": 5,
"vendorName": "Jane Smith (Elite Electricals)",
"serviceCategory": "Electrical",
"openingBalance": 0.00,
"totalBilled": 400.00,
"totalPaid": 0.00,
"closingBalance": 400.00,
"transactions": [
{
"date": "2024-02-20",
"billNumber": "BILL-005",
"description": "Electrical panel upgrade",
"amount": 400.00,
"status": "UNPAID",
"runningBalance": 400.00
}
]
}
]
}
}
```

## Example 2 — Specific Vendor
# Request
`http GET /api/v1/finance/reports/vendor-ledger?vendorId=4`
# Response
```json
{
"success": true,
"data": {
"from": "2026-01-01",
"to": "2026-06-06",
"vendors": [
{
"vendorId": 4,
"vendorName": "John Doe (ABC Plumbing)",
"serviceCategory": "Maintenance",
"openingBalance": 500.00,
"totalBilled": 700.00,
"totalPaid": 200.00,
"closingBalance": 1000.00,
"transactions": []
}
]
}
}
```

## Example 3 — Association Filter
# Request
`http GET /api/v1/finance/reports/vendor-ledger?associationId=1`
# Response
```json
{
"success": true,
"data": {
"from": "2026-01-01",
"to": "2026-06-06",
"vendors": [
{
"vendorId": 4,
"vendorName": "John Doe (ABC Plumbing)",
"serviceCategory": "Maintenance",
"openingBalance": 500.00,
"totalBilled": 700.00,
"totalPaid": 200.00,
"closingBalance": 1000.00,
"transactions": []
},
{
"vendorId": 5,
"vendorName": "Jane Smith (Elite Electricals)",
"serviceCategory": "Electrical",
"openingBalance": 0.00,
"totalBilled": 400.00,
"totalPaid": 0.00,
"closingBalance": 400.00,
"transactions": []
}
]
}
}
```

## Example 4 — Custom Date Range
# Request
`http GET /api/v1/finance/reports/vendor-ledger?dateRange=CUSTOM&from=2024-01-01&to=2024-12-31`
# Response
```json
{
"success": true,
"data": {
"from": "2024-01-01",
"to": "2024-12-31",
"vendors": [
{
"vendorId": 4,
"vendorName": "John Doe (ABC Plumbing)",
"serviceCategory": "Maintenance",
"openingBalance": 500.00,
"totalBilled": 700.00,
"totalPaid": 200.00,
"closingBalance": 1000.00,
"transactions": [
{
"date": "2024-01-05",
"billNumber": "BILL-002",
"description": "Pipe repair",
"amount": 200.00,
"status": "PAID",
"runningBalance": 700.00
},
{
"date": "2024-01-05",
"billNumber": "BILL-002",
"description": "Payment - BILL-002",
"amount": -200.00,
"status": "PAID",
"runningBalance": 500.00
},
{
"date": "2024-02-10",
"billNumber": "BILL-003",
"description": "Water heater installation",
"amount": 350.00,
"status": "UNPAID",
"runningBalance": 850.00
},
{
"date": "2024-03-01",
"billNumber": "BILL-004",
"description": "Emergency pipe fix",
"amount": 150.00,
"status": "OVERDUE",
"runningBalance": 1000.00
}
]
},
{
"vendorId": 5,
"vendorName": "Jane Smith (Elite Electricals)",
"serviceCategory": "Electrical",
"openingBalance": 0.00,
"totalBilled": 400.00,
"totalPaid": 0.00,
"closingBalance": 400.00,
"transactions": [
{
"date": "2024-02-20",
"billNumber": "BILL-005",
"description": "Electrical panel upgrade",
"amount": 400.00,
"status": "UNPAID",
"runningBalance": 400.00
}
]
}
]
}
}
```

## Example 5 — LAST_YEAR
# Request
`httpGET /api/v1/finance/reports/vendor-ledger?dateRange=LAST_YEAR`
# Response
```json
{
"success": true,
"data": {
"from": "2025-01-01",
"to": "2025-12-31",
"vendors": []
}
}
```

## Example 6 — All Filters Combined
# Request
`http GET /api/v1/finance/reports/vendor-ledger?associationId=1&vendorId=4&dateRange=CUSTOM&from=2024-01-01&to=2024-12-31`
# Response
```json
{
"success": true,
"data": {
"from": "2024-01-01",
"to": "2024-12-31",
"vendors": [
{
"vendorId": 4,
"vendorName": "John Doe (ABC Plumbing)",
"serviceCategory": "Maintenance",
"openingBalance": 500.00,
"totalBilled": 700.00,
"totalPaid": 200.00,
"closingBalance": 1000.00,
"transactions": [
{
"date": "2024-01-05",
"billNumber": "BILL-002",
"description": "Pipe repair",
"amount": 200.00,
"status": "PAID",
"runningBalance": 700.00
},
{
"date": "2024-01-05",
"billNumber": "BILL-002",
"description": "Payment - BILL-002",
"amount": -200.00,
"status": "PAID",
"runningBalance": 500.00
},
{
"date": "2024-02-10",
"billNumber": "BILL-003",
"description": "Water heater installation",
"amount": 350.00,
"status": "UNPAID",
"runningBalance": 850.00
},
{
"date": "2024-03-01",
"billNumber": "BILL-004",
"description": "Emergency pipe fix",
"amount": 150.00,
"status": "OVERDUE",
"runningBalance": 1000.00
}
]
}
]
}
}
```

## Example 7 — No Data Found (wrong associationId)
# Request
`http GET /api/v1/finance/reports/vendor-ledger?associationId=999`
# Response
```json
{
"success": true,
"data": {
"from": "2026-01-01",
"to": "2026-06-06",
"vendors": []
}
}
```

## Example 8 — No Data Found (wrong vendorId)
# Request
` http GET /api/v1/finance/reports/vendor-ledger?vendorId=9999`
# Response
```json
{
"success": true,
"data": {
"from": "2026-01-01",
"to": "2026-06-06",
"vendors": []
}
}
```

# 📊 Endpoint: Budget vs Actual Report

### ✅ Request Details

- **Type:** GET
- **URL:** `http://localhost:8080/api/v1/finance/reports/budget-vs-actual`

---

## 📤 Query Parameters

| Parameter | Type | Required | Default |
|------------|--------|-----------|---------|
| budgetId | Long | ✅ | — |
| associationId | Long | ❌ | All Associations |
| accountingBasis | CASH / ACCRUAL | ❌ | ACCRUAL |
| dateRange | THIS_YEAR / CUSTOM | ❌ | THIS_YEAR |
| from | yyyy-MM-dd | ❌ | Budget start date |
| to | yyyy-MM-dd | ❌ | Budget end date |

---

## 📐 Variance Formula

```
variance           = budgetedAmount - actualAmount
variancePercentage = variance / budgetedAmount × 100
```

### Sign Convention

| Account Type | Positive Variance | Negative Variance |
|---|---|---|
| INCOME | Shortfall ❌ (collected less than planned) | Exceeded budget ✅ (collected more) |
| EXPENSES | Under budget ✅ (spent less than planned) | Over budget ❌ (spent more) |

---

## Example 1 — Missing budgetId (Required Field)

### Request

```http
GET /api/v1/finance/reports/budget-vs-actual
```

### Response

```json
{
  "success": false,
  "error": "budgetId is required. Please select a budget.",
  "errorCode": "BUDGET_ID_REQUIRED"
}
```

---

## Example 2 — Wrong budgetId

### Request

```http
GET /api/v1/finance/reports/budget-vs-actual?budgetId=99999
```

### Response

```json
{
  "success": false,
  "error": "Budget not found: 99999"
}
```

---

## Example 3 — Budget With No Line Items

### Request

```http
GET /api/v1/finance/reports/budget-vs-actual?budgetId=1
```

### Response

```json
{
  "success": true,
  "data": {
    "budgetName": "2024 Annual Budget",
    "from": "2024-01-01",
    "to": "2024-12-31",
    "totalBudgeted": 0.00,
    "totalActual": 0.00,
    "totalVariance": 0.00,
    "rows": []
  }
}
```

---

## Example 4 — Full Report, THIS_YEAR (Default)

### Request

```http
GET /api/v1/finance/reports/budget-vs-actual?budgetId=2&dateRange=THIS_YEAR&accountingBasis=ACCRUAL
```

### Response

```json
{
  "success": true,
  "data": {
    "budgetName": "2025 Annual Budget",
    "from": "2025-01-01",
    "to": "2025-12-31",
    "totalBudgeted": 70000.00,
    "totalActual": 35500.00,
    "totalVariance": 34500.00,
    "rows": [
      {
        "accountCode": "103",
        "accountName": "m4",
        "accountType": "INCOME",
        "budgetedAmount": 50000.00,
        "actualAmount": 35500.00,
        "variance": 14500.00,
        "variancePercentage": 29.00
      },
      {
        "accountCode": "wdk",
        "accountName": "payments",
        "accountType": "EXPENSES",
        "budgetedAmount": 12000.00,
        "actualAmount": 0.00,
        "variance": 12000.00,
        "variancePercentage": 100.00
      },
      {
        "accountCode": "1011",
        "accountName": "m",
        "accountType": "ASSETS",
        "budgetedAmount": 8000.00,
        "actualAmount": 0.00,
        "variance": 8000.00,
        "variancePercentage": 100.00
      }
    ]
  }
}
```

---

## Example 5 — Custom Date Range

### Request

```http
GET /api/v1/finance/reports/budget-vs-actual?budgetId=2&dateRange=CUSTOM&from=2024-01-01&to=2024-12-31&accountingBasis=ACCRUAL
```

### Response

```json
{
  "success": true,
  "data": {
    "budgetName": "2025 Annual Budget",
    "from": "2024-01-01",
    "to": "2024-12-31",
    "totalBudgeted": 70000.00,
    "totalActual": 48000.00,
    "totalVariance": 22000.00,
    "rows": [
      {
        "accountCode": "103",
        "accountName": "m4",
        "accountType": "INCOME",
        "budgetedAmount": 50000.00,
        "actualAmount": 48000.00,
        "variance": 2000.00,
        "variancePercentage": 4.00
      },
      {
        "accountCode": "wdk",
        "accountName": "payments",
        "accountType": "EXPENSES",
        "budgetedAmount": 12000.00,
        "actualAmount": 0.00,
        "variance": 12000.00,
        "variancePercentage": 100.00
      },
      {
        "accountCode": "1011",
        "accountName": "m",
        "accountType": "ASSETS",
        "budgetedAmount": 8000.00,
        "actualAmount": 0.00,
        "variance": 8000.00,
        "variancePercentage": 100.00
      }
    ]
  }
}
```

---

## Example 6 — Filter by associationId

### Request

```http
GET /api/v1/finance/reports/budget-vs-actual?budgetId=2&associationId=1&dateRange=THIS_YEAR
```

### Response

```json
{
  "success": true,
  "data": {
    "budgetName": "2025 Annual Budget",
    "from": "2025-01-01",
    "to": "2025-12-31",
    "totalBudgeted": 70000.00,
    "totalActual": 35500.00,
    "totalVariance": 34500.00,
    "rows": [
      {
        "accountCode": "103",
        "accountName": "m4",
        "accountType": "INCOME",
        "budgetedAmount": 50000.00,
        "actualAmount": 35500.00,
        "variance": 14500.00,
        "variancePercentage": 29.00
      },
      {
        "accountCode": "wdk",
        "accountName": "payments",
        "accountType": "EXPENSES",
        "budgetedAmount": 12000.00,
        "actualAmount": 0.00,
        "variance": 12000.00,
        "variancePercentage": 100.00
      },
      {
        "accountCode": "1011",
        "accountName": "m",
        "accountType": "ASSETS",
        "budgetedAmount": 8000.00,
        "actualAmount": 0.00,
        "variance": 8000.00,
        "variancePercentage": 100.00
      }
    ]
  }
}
```

---

## Example 7 — CASH Basis

### Request

```http
GET /api/v1/finance/reports/budget-vs-actual?budgetId=2&accountingBasis=CASH&dateRange=THIS_YEAR
```

### Response

```json
{
  "success": true,
  "data": {
    "budgetName": "2025 Annual Budget",
    "from": "2025-01-01",
    "to": "2025-12-31",
    "totalBudgeted": 70000.00,
    "totalActual": 30000.00,
    "totalVariance": 40000.00,
    "rows": [
      {
        "accountCode": "103",
        "accountName": "m4",
        "accountType": "INCOME",
        "budgetedAmount": 50000.00,
        "actualAmount": 30000.00,
        "variance": 20000.00,
        "variancePercentage": 40.00
      },
      {
        "accountCode": "wdk",
        "accountName": "payments",
        "accountType": "EXPENSES",
        "budgetedAmount": 12000.00,
        "actualAmount": 0.00,
        "variance": 12000.00,
        "variancePercentage": 100.00
      },
      {
        "accountCode": "1011",
        "accountName": "m",
        "accountType": "ASSETS",
        "budgetedAmount": 8000.00,
        "actualAmount": 0.00,
        "variance": 8000.00,
        "variancePercentage": 100.00
      }
    ]
  }
}
```

---

## Example 8 — No Ledger Data in Range (All Actuals = 0)

### Request

```http
GET /api/v1/finance/reports/budget-vs-actual?budgetId=2&dateRange=CUSTOM&from=2020-01-01&to=2020-12-31
```

### Response

```json
{
  "success": true,
  "data": {
    "budgetName": "2025 Annual Budget",
    "from": "2020-01-01",
    "to": "2020-12-31",
    "totalBudgeted": 70000.00,
    "totalActual": 0.00,
    "totalVariance": 70000.00,
    "rows": [
      {
        "accountCode": "103",
        "accountName": "m4",
        "accountType": "INCOME",
        "budgetedAmount": 50000.00,
        "actualAmount": 0.00,
        "variance": 50000.00,
        "variancePercentage": 100.00
      },
      {
        "accountCode": "wdk",
        "accountName": "payments",
        "accountType": "EXPENSES",
        "budgetedAmount": 12000.00,
        "actualAmount": 0.00,
        "variance": 12000.00,
        "variancePercentage": 100.00
      },
      {
        "accountCode": "1011",
        "accountName": "m",
        "accountType": "ASSETS",
        "budgetedAmount": 8000.00,
        "actualAmount": 0.00,
        "variance": 8000.00,
        "variancePercentage": 100.00
      }
    ]
  }
}
```

---

## Example 9 — No Filter (Only budgetId, Defaults Applied)

### Request

```http
GET /api/v1/finance/reports/budget-vs-actual?budgetId=2
```

### Response

```json
{
  "success": true,
  "data": {
    "budgetName": "2025 Annual Budget",
    "from": "2026-01-01",
    "to": "2026-06-06",
    "totalBudgeted": 70000.00,
    "totalActual": 0.00,
    "totalVariance": 70000.00,
    "rows": [
      {
        "accountCode": "103",
        "accountName": "m4",
        "accountType": "INCOME",
        "budgetedAmount": 50000.00,
        "actualAmount": 0.00,
        "variance": 50000.00,
        "variancePercentage": 100.00
      },
      {
        "accountCode": "wdk",
        "accountName": "payments",
        "accountType": "EXPENSES",
        "budgetedAmount": 12000.00,
        "actualAmount": 0.00,
        "variance": 12000.00,
        "variancePercentage": 100.00
      },
      {
        "accountCode": "1011",
        "accountName": "m",
        "accountType": "ASSETS",
        "budgetedAmount": 8000.00,
        "actualAmount": 0.00,
        "variance": 8000.00,
        "variancePercentage": 100.00
      }
    ]
  }
}
```

---

## Example 10 — Wrong associationId (No Actuals Found)

### Request

```http
GET /api/v1/finance/reports/budget-vs-actual?budgetId=2&associationId=999&dateRange=THIS_YEAR
```

### Response

```json
{
  "success": true,
  "data": {
    "budgetName": "2025 Annual Budget",
    "from": "2025-01-01",
    "to": "2025-12-31",
    "totalBudgeted": 70000.00,
    "totalActual": 0.00,
    "totalVariance": 70000.00,
    "rows": [
      {
        "accountCode": "103",
        "accountName": "m4",
        "accountType": "INCOME",
        "budgetedAmount": 50000.00,
        "actualAmount": 0.00,
        "variance": 50000.00,
        "variancePercentage": 100.00
      },
      {
        "accountCode": "wdk",
        "accountName": "payments",
        "accountType": "EXPENSES",
        "budgetedAmount": 12000.00,
        "actualAmount": 0.00,
        "variance": 12000.00,
        "variancePercentage": 100.00
      },
      {
        "accountCode": "1011",
        "accountName": "m",
        "accountType": "ASSETS",
        "budgetedAmount": 8000.00,
        "actualAmount": 0.00,
        "variance": 8000.00,
        "variancePercentage": 100.00
      }
    ]
  }
}
```

---
