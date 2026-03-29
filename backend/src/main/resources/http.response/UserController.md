# 📦 SocietyManagement API – Test Results

## 🔄 Endpoint: Register User

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/users/register`
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
- **URL**: `http://localhost:8080/users/login`
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
## 🔄 Endpoint: Refresh

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/users/refresh`
- **Request Name**: Refresh token

### 📤 Response Body (JSON)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkB0ZW5hbnQuY29tIiwidGVuYW50SWQiOjAsInJvbGUiOiJURU5BTlRfQURNSU4iLCJ1c2VySWQiOjMsImlhdCI6MTc3NDgwODU3OCwiZXhwIjoxNzc0ODk0OTc4fQ.Ouqha4h5Vyr7ikEPUlvu8kvZLbEu4tjV5xQGl4xzFog",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIiwianRpIjoiNTI5ZDdhNGQtNDFmYi00MTc5LTlhYTgtYTkwYWJlOTFjMTI0IiwiaWF0IjoxNzc0ODA4NTc4LCJleHAiOjE3NzU0MTMzNzh9.mv0rG1fL5i-0AWr2SF9W-3LHYEq-UfEGvnZmYVZ_ZRc"
}
```
- **Response Status**: 200 OK