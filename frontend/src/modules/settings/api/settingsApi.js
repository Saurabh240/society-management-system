import httpClient from "@/api/httpClient";

/* ── ACCOUNT ─────────────────────────────────────────────────────────────── */

export const getAccountInfo = async () => {
  const res = await httpClient.get("/api/v1/tenant/me");
  return res.data?.data ?? res.data;
};

export const updateAccountInfo = async (data) => {
  const res = await httpClient.put("/api/v1/tenant/me", data);
  return res.data?.data ?? res.data;
};

/* ── USERS ───────────────────────────────────────────────────────────────── */

export const getUsers = async () => {
  const res = await httpClient.get("/users");
  return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
};

export const inviteUser = async (data) => {
  const res = await httpClient.post("/users/invite", data);
  return res.data;
};

export const updateUserStatus = async (id, status) => {
  const res = await httpClient.put(`/users/${id}/status`, { status });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await httpClient.delete(`/users/${id}`);
  return res.data;
};

/* ── ROLES ───────────────────────────────────────────────────────────────── */

export const getRoles = async () => {
  const res = await httpClient.get("/users/roles");
  // Backend returns a plain array of { role, permissionLabel, userCount }
  return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
};

/* ── BILLING ─────────────────────────────────────────────────────────────── */

export const getBillingInfo = async () => {
  const res = await httpClient.get("/subscription");
  return res.data;
};