import httpClient from "@/api/httpClient";

/* ACCOUNT */

export const getAccountInfo = async (tenantId) => {
  const res = await httpClient.get(`/platform/tenants/${tenantId}`);
  return res.data;
};

export const updateAccountInfo = async (tenantId, data) => {
  const res = await httpClient.put(`/platform/tenants/${tenantId}`, data);
  return res.data;
};

/* USERS */

export const getUsers = async () => {
  const res = await httpClient.get("/users");
  return res.data;
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

/* ROLES */

export const getRoles = async () => {
  const res = await httpClient.get("/users/roles");
  return res.data;
};

/*BILLING*/

export const getBillingInfo = async () => {
  const res = await httpClient.get("/subscription");
  return res.data;
};