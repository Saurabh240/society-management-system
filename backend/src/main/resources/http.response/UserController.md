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
  "name": "admin",
  "password": "password",
  "role": "role"
}

```

### 📤 Response Body (JSON)
```json
{
  "id": 1,
  "name": "admin",
  "email": "admin@tenant.com",
  "role": "TENANT_ADMIN",
  "status": "ACTIVE"
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

## 🔄 Endpoint: Users List

### ✅ Request Details

- **Type**: GET
- **URL**: `http://localhost:8080/users`
- **Request Name**:  Users List


### 📤 Response Body (JSON)
```json
[
  {
    "id": 3,
    "name": "Platform Admin",
    "email": "platform@admin.com",
    "role": "PLATFORM_ADMIN",
    "status": "INACTIVE"
  },
  {
    "id": 5,
    "name": "Abhi Garg",
    "email": "abhigarg5969@gmail.com",
    "role": "TENANT_ADMIN",
    "status": "ACTIVE"
  },
  {
    "id": 7,
    "name": "A",
    "email": "abhigarg596@gmail.com",
    "role": "TENANT_ADMIN",
    "status": "ACTIVE"
  }
]
```
- **Response Status**: 200 OK
----

## 🔄 Endpoint: STATUS UPDATE

### ✅ Request Details

- **Type**: PUT
- **URL**: `http://localhost:8080/users/id/status`
- **Request Name**: User Status

### 📤 Request Body (JSON)
```json
{
  "status": "INACTIVE"
}

```

### 📤 Response Body (JSON)
```json
{
  "id": 5,
  "name": "Abhi Garg",
  "email": "abhigarg5969@gmail.com",
  "role": "TENANT_ADMIN",
  "status": "INACTIVE"
}
```
- **Response Status**: 200 OK
----

## 🔄 Endpoint: DELETE USER

### ✅ Request Details

- **Type**: PUT
- **URL**: `http://localhost:8080/users/id`
- **Request Name**: User DELETE

- **Response Status**: 204 No content
----

## 🔄 Endpoint: Refresh

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/users/refresh`
- **Request Name**: Refresh token

### 📤 Response Body (JSON)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkB0ZW5hbnQuY29tIiwidGVuYW50SWQiOjAsInJvbGUiOiJURU5BTlRfQURNSU4iLCJ1c2VySWQiOjMsImlhdCI6MTc3NTA0OTAzMSwiZXhwIjoxNzc1MTM1NDMxfQ.-QQkDfj5CFjdP9Bg2_dzji8Mnc0czFcM29IUocJASMc"
}
```
- **Response Status**: 200 OK

## 🔄 Endpoint: Invite User

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/users/invite`
- **Request Name**:  invite user


### 📤 Response Body (JSON)
```json
{
  "name": "Test User",
  "email": "testuser1@example.com",
  "role": "TENANT_USER"
}
```
### 📤 Response Body (JSON)
```json
{
  "id": 5,
  "name": "Test User",
  "email": "testuser1@example.com",
  "role": "TENANT_USER",
  "status": "ACTIVE"
}
```
- **Response Status**: 200 OK
----

## 🔄 Endpoint: Reset Password

### ✅ Request Details

- **Type**: POST
- **URL**: `http://localhost:8080/users/reset-password`
- **Request Name**:  rest password
### 📤 Response Body (JSON)
```json
{
"token": "PASTE_THE_TOKEN_HERE",
"newPassword": "NewStrongPass123"
}
```

- **Response Status**: 204 


## 🔄 Endpoint: Login

### ✅ Request Details

- **Type**:GET
- **URL**: `http://localhost:8080/users/roles
- **Request Name**: role definition

### 📤 Response Body (JSON)
```json
[
  {
    "role": "TENANT_ADMIN",
    "permissionLabel": "Full Access",
    "userCount": 2
  },
  {
    "role": "MANAGER",
    "permissionLabel": "Read/Write",
    "userCount": 1
  },
  {
    "role": "VIEWER",
    "permissionLabel": "Read Only",
    "userCount": 1
  }
]
```
- **Response Status**: 200 OK
----
