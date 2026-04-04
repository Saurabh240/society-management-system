# Mailing API Contract

Base path: `/api/communications/mailings`

---

## 1. List Mailings
`GET /api/communications/mailings?tenantId={id}&page=0&size=20`

**Response 200**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Annual Report 2025",
      "recipientLabel": "Sunset Village (2 owners)",
      "date": "2026-01-15T09:30:00Z",
      "status": "DELIVERED"
    }
  ],
  "totalElements": 2,
  "totalPages": 1,
  "number": 0,
  "size": 20
}
```

---

## 2. Get Mailing by ID  ← used to populate Edit form
`GET /api/communications/mailings/{id}`

**Response 200**
```json
{
  "id": 1,
  "title": "Annual Report 2025",
  "content": "Please find attached the annual report for 2025...",
  "recipientType": "ASSOCIATION_OWNERS",
  "associationId": 10,
  "ownerIds": [101, 102],
  "recipientLabel": "Sunset Village (2 owners)",
  "templateId": 3,
  "templateLevel": "Association",
  "date": "2026-01-15T09:30:00Z",
  "status": "DELIVERED"
}
```

---

## 3. Create Mailing
`POST /api/communications/mailings`

**Request body**
```json
{
  "associationId": 10,
  "recipientType": "ASSOCIATION_OWNERS",
  "ownerIds": [101, 102],
  "templateId": 3,
  "title": "Annual Report 2025",
  "content": "Please find attached the annual report for 2025..."
}
```
- `ownerIds` — optional; if omitted, all owners in the association are targeted
- `templateId` — optional

**Response 200**: `{ "id": 1 }`

---

## 4. Update Mailing  ← Edit form "Update Mailing" button
`PUT /api/communications/mailings/{id}`

**Request body** (same shape as Create)
```json
{
  "associationId": 10,
  "recipientType": "ASSOCIATION_OWNERS",
  "ownerIds": [101, 102],
  "templateId": 3,
  "title": "Annual Report 2025",
  "content": "Updated content here..."
}
```

**Response 204** No Content

---

## 5. Delete Mailing
`DELETE /api/communications/mailings/{id}`

**Response 204** No Content

---
## 🔄 Endpoint: Delete all sms by Id

### ✅ Request Details

- **Type**: DELETE All emails By Id
- **URL**: `http://localhost:8080/api/v1/communications/email/batch`
- **Request Name**: Delete all email by id

### ✅ Request Body (JSON)
```json
[2,3,4]
```
- **Response Status**: 200 OK

## 6. Get Owners for Association  ← populates the owner checkbox list on Edit
`GET /api/communications/mailings/owners?associationId={id}`

**Response 200**
```json
[
  { "ownerId": 101, "name": "Emily Martinez", "unitNumber": "Unit 201", "email": "emily@example.com" },
  { "ownerId": 102, "name": "David Chen",     "unitNumber": "Unit 301", "email": "david@example.com" },
  { "ownerId": 103, "name": "Sarah Chen",     "unitNumber": "Unit 302", "email": "sarah@example.com" }
]
```

---

## Enums

| Field           | Values                                          |
|-----------------|-------------------------------------------------|
| `recipientType` | `ASSOCIATION_OWNERS`, `ALL_RESIDENTS`, `BOARD_MEMBERS` |
| `status`        | `DRAFT`, `DELIVERED`                            |

---

## Error responses

| Status | When                                      |
|--------|-------------------------------------------|
| 400    | Validation failure — body has field errors |
| 404    | Mailing not found                          |
| 422    | Edit attempted on a DELIVERED mailing      |