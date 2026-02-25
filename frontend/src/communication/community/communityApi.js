import httpClient from "../../api/httpClient";

// ─── GET /community/all ───────────────────────────────────────
export const fetchCommunities = async () => {
  try {
    const response = await httpClient.get("/community/all");
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch communities" };
  }
};

// ─── GET /community/{id} ──────────────────────────────────────
export const fetchCommunityById = async (id) => {
  try {
    const response = await httpClient.get(`/community/${id}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch community" };
  }
};

// ─── POST /community ──────────────────────────────────────────
// request body: { name }
// response: { success, data: { id, name, status, tenantId, createdAt, updatedAt } }
export const createCommunity = async (payload) => {
  try {
    const response = await httpClient.post("/community", {
      name: payload.name,
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create community" };
  }
};

// ─── PATCH /community/{id} ────────────────────────────────────
// request body: { name, status }
// response: { success, data: { id, name, status, tenantId, createdAt, updatedAt } }
export const updateCommunity = async (id, payload) => {
  try {
    const response = await httpClient.patch(`/community/${id}`, {
      name: payload.name,
      status: payload.status,
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update community" };
  }
};

// ─── DELETE /community/{id} ───────────────────────────────────
// response: { success, data: {} }
export const deleteCommunity = async (id) => {
  try {
    const response = await httpClient.delete(`/community/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete community" };
  }
};