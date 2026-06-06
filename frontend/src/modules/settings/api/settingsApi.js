import httpClient from "@/api/httpClient";

// ── ACCOUNT ───────────────────────────────────────────────────────────────────
// Uses /tenant/admin/account — accessible to TENANT_ADMIN only
// Response: ApiResponse<TenantResponse>
// TenantResponse fields: id, name, subdomain, status, streetAddress,
//                        city, state, zipCode, phone, email, accountOwner, accountUrl

export const getAccountInfo = () =>
  httpClient.get("/tenant/admin/account");

export const updateAccountInfo = (data) =>
  httpClient.put("/tenant/admin/account", data);

// ── USERS ─────────────────────────────────────────────────────────────────────
// Response: ApiResponse<List<UserResponse>>
// UserResponse fields: id, name, email, role (enum string), status (ACTIVE|INACTIVE)

export const getUsers = () =>
  httpClient.get("/users");

export const inviteUser = (data) =>
  httpClient.post("/users/invite", data);

// status: "ACTIVE" | "INACTIVE"
export const updateUserStatus = (id, status) =>
  httpClient.put(`/users/${id}/status`, { status });

// role: "TENANT_ADMIN" | "MANAGER" | "VIEWER"
export const updateUserRole = (id, role) =>
  httpClient.put(`/users/${id}/role`, { role });

export const deleteUser = (id) =>
  httpClient.delete(`/users/${id}`);

// ── ROLES ─────────────────────────────────────────────────────────────────────
// Response: ApiResponse<List<RoleResponse>>
// RoleResponse fields: role (string), permissionLabel, userCount

export const getRoles = () =>
  httpClient.get("/users/roles");

// ── BILLING ───────────────────────────────────────────────────────────────────
// Response: SubscriptionResponse (no ApiResponse wrapper — direct object)
// Fields: id, tenantId, unitLimit, unitsUsed, status, planName, nextBillingDate

export const getBillingInfo = () =>
  httpClient.get("/subscription");