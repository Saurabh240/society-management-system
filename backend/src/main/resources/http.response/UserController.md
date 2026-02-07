# 📦 SocietyManagement API – Test Results

## 🔄 Endpoint: Register User

### ✅ Request Details

- **Type**: POST
- **URL**: `http://acme.localhost:8080/users/register`
- **Request Name**: Register User

### 📤 Request Body (JSON)
```json
{
  "email": "admin@tenant.com",
  "password": "password"
}

```

### 📤 Response Body (JSON)
```json
{
  "id": 1,
  "email": "admin@tenant.com",
  "role": "TENANT_ADMIN"
}
```
- **Response Status**: 200 OK
----
## 🔄 Endpoint: Login

### ✅ Request Details

- **Type**: POST
- **URL**: `http://acme.localhost:8080/users/login`
- **Request Name**: Login

### 📤 Request Body (JSON)
```json
{
  "email": "admin@tenant.com",
  "password": "password"
}
```
### 📤 Response Body (JSON)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkB0ZW5hbnQuY29tIiwidGVuYW50SWQiOjEsInJvbGUiOiJURU5BTlRfQURNSU4iLCJpYXQiOjE3NzAzOTk4MTUsImV4cCI6MTc3MDQ4NjIxNX0.TypIjdE4MQVfumhPLc2OhrtFVmLpTo-dw96vQCiG1Mo",
  "role": "TENANT_ADMIN"
}
```
- **Response Status**: 200 OK
----