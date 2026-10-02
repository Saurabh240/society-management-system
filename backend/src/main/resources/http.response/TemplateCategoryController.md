# 📘 Template Category API – Testing Guide
## 🔄 Endpoint: Create Category
### ✅ Request Details
- **Type**: POST
- **URL**: `{{baseUrl}}/api/v1/communications/template-categories`
- **Request Name** : Create Category
### 📤 Request Body (JSON)
``````json
{
"name": "Assessment Reminders"
}
``````

## ✅ Response Body (JSON) — Success
````json
{
"id": 1,
"name": "Assessment Reminders"
}
`````
- **Response Status**: 200 OK
---

## 🔄 Create Category — Duplicate (case-insensitive)
### ✅ Request Details
- **Type**: POST
- **URL**: {{baseUrl}}/api/v1/communications/template-categories
- **Request Name** : Create Category (duplicate)
### 📤 Request Body (JSON)
```json
{
"name": "assessment reminders"
}
```
## ✅ Response Body (JSON) — Error
```json
{
"success": false,
"error": "Category 'Assessment Reminders' already exists",
"errorCode": "INTERNAL_ERROR"
}
```
- **Response Status**: 400 (or whatever your global handler maps IllegalArgumentException to)
---
- Confirms category names are deduplicated case-insensitively per tenant.
## 🔄 Endpoint: Create Category — Blank Name
### ✅ Request Details
- **Type**: POST
- **URL**: {{baseUrl}}/api/v1/communications/template-categories
- **URL**: Create Category (blank)
## 📤 Request Body (JSON)
```json
{
"name": "   "
}
```
## ✅ Response Body (JSON) — Error
```json
{
"success": false,
"error": "Category name must not be blank",
"errorCode": "VALIDATION_ERROR"
}
```
- **Response Status**: 400 Bad Request
---
## 🔄 Endpoint: List All Categories
### ✅ Request Details
- **Type**: GET
- **URL**: {{baseUrl}}/api/v1/communications/template-categories
- **URL**: Get All Categories
### ✅ Response Body (JSON) — Success
```json
[
  {
    "id": 1,
    "name": "Assessment Reminders"
  },
  {
    "id": 2,
    "name": "Late Payment Notice"
  }
]
```
- **Response Status**: 200 OK
------
Results are scoped to the current tenant (via TenantContext) and ordered alphabetically by name.
How It Works
- GET  /communications/template-categories          → List all categories for the tenant
- POST /communications/template-categories           → Create a new category explicitly
(backs the "create new category if not
in the list" dropdown flow)

- A category also gets auto-created the first time it's used on a template — see below.

## 🔄 Regression: Category auto-creation via Template Create/Update

- These verify TemplateServiceImpl's new ensureCategoryExists(...) call — a category string on a template that isn't in the lookup yet gets silently added, rather than rejected.
------
### ✅ Request Details
- **Type**: POST
- **URL**: {{baseUrl}}/api/v1/communications/templates
- **Request Name**: Create Template (new category)
### 📤 Request Body (JSON)
````json
{
"name": "Late Payment Notice",
"level": "ASSOCIATION",
"category": "Billing",
"description": "Sent when a unit's balance is overdue",
"recipientType": "OWNER",
"subject": "Payment Reminder",
"content": "Hi {{ownerName}}, your balance is overdue."
}
````
###✅ Response Body (JSON) — Success
```json
{
"id": 3,
"tenantId": 2,
"name": "Late Payment Notice",
"level": "ASSOCIATION",
"category": "Billing",
"description": "Sent when a unit's balance is overdue",
"recipientType": "OWNER",
"subject": "Payment Reminder",
"content": "Hi {{ownerName}}, your balance is overdue.",
"lastModified": "2026-09-27T10:12:00.000000Z"
}
```
- **Response Status**: 200 OK
- Then verify the category was auto-registered
- **Type**: GET
- **URL**: {{baseUrl}}/api/v1/communications/template-categories
### ✅ Expected
- "Billing" now appears in the list, even though it was never explicitly created via POST /template-categories.
### ✅ Request Details — re-using the same category shouldn't duplicate it
- **Type**: POST
- **URL**: {{baseUrl}}/api/v1/communications/templates
- **Request Name**: Create Template (existing category, different case)
### 📤 Request Body (JSON)
```json
{
"name": "Second Notice",
"level": "ASSOCIATION",
"category": "billing",
"description": "Follow-up notice",
"recipientType": "OWNER",
"subject": "Second Reminder",
"content": "This is a follow-up."
}
```
### ✅ Expected
- Template creation succeeds (200 OK), and GET /communications/template-categories still shows one entry for Billing (original casing "Billing" preserved) — not a second "billing" row.
### ✅ Request Details — Update Template with a brand-new category
- **Type**:PUT
- **URL**: {{baseUrl}}/api/v1/communications/templates/3
- **Request Name**: Update Template (new category)
### 📤 Request Body (JSON)
```json
{
"name": "Late Payment Notice",
"level": "ASSOCIATION",
"category": "Collections",
"description": "Sent when a unit's balance is overdue",
"recipientType": "OWNER",
"subject": "Payment Reminder",
"content": "Hi {{ownerName}}, your balance is overdue."
}
````
- ✅ Expected
200 OK, and "Collections" now appears in GET /communications/template-categories too — confirms updateTemplate() also calls ensureCategoryExists(...).
## 🔄 Regression: Existing templates with arbitrary category strings still load

- Requires at least one template that predates this change (created before template_categories existed), or one inserted directly with an arbitrary category value not present in the lookup table.

### ✅ Request Details
- **Type** GET
- **URL**: {{baseUrl}}/api/v1/communications/templates/{legacyTemplateId}
- **Request Name**: Get Legacy Template by Id
### ✅ Expected
200 OK, response includes the original category string unchanged (e.g. "category": "Newsletter"), regardless of whether that value exists in template_categories for this tenant.
- Confirms CommunicationTemplate.category was never migrated/coerced — it's still a free string column, and reading it never depends on a matching lookup row existing.