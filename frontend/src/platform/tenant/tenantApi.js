import httpClient from "../../api/httpClient";

export const fetchTenants = async () => {
  try {
    const response = await httpClient.get("/platform/tenants");
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch tenants",
      }
    );
  }
};


export const createTenant = async (tenant) => {
  try {
    const response = await httpClient.post(
      "/platform/tenants",
      tenant
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to create tenant",
      }
    );
  }
};

export const updateSubscription = async (tenantId, unitLimit, status) => {
  try {
    const response = await httpClient.post("/subscription", null, {
      params: { tenantId, unitLimit, status },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to update subscription",
      }
    );
  }};