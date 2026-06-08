import httpClient from "@/api/httpClient";

// ── ACCOUNT ───────────────────────────────────────────────────────────────────
export const getAccountInfo   = ()       => httpClient.get("/tenant/admin/account");
export const updateAccountInfo = (data)  => httpClient.put("/tenant/admin/account", data);

// ── USERS ─────────────────────────────────────────────────────────────────────
export const getUsers          = ()               => httpClient.get("/users");
export const inviteUser        = (data)           => httpClient.post("/users/invite", data);
export const updateUserStatus  = (id, status)     => httpClient.put(`/users/${id}/status`, { status });
export const updateUserRole    = (id, role)       => httpClient.put(`/users/${id}/role`,   { role   });
export const deleteUser        = (id)             => httpClient.delete(`/users/${id}`);

// ── ROLES ─────────────────────────────────────────────────────────────────────
export const getRoles = () => httpClient.get("/users/roles");

/**
 * Updates the permission matrix for a role.
 * Calls PUT /api/v1/settings/roles/{id}/permissions
 *
 * @param {string}  roleId      - Role identifier (e.g. "MANAGER")
 * @param {Array}   permissions - Array of { menuKey, canView, canEdit, canDelete }
 *
 * NOTE: This endpoint is part of the forthcoming custom roles API (BE-3).
 * Until that backend is merged, this call will return 404. The RolesTab
 * catches the error and shows a toast so the UI degrades gracefully.
 */
export const updateRolePermissions = (roleId, permissions) =>
  httpClient.put(`/api/v1/settings/roles/${roleId}/permissions`, { permissions });

// ── BILLING ───────────────────────────────────────────────────────────────────
// Returns SubscriptionResponse directly (no ApiResponse wrapper) — use res.data
export const getBillingInfo = () => httpClient.get("/subscription");