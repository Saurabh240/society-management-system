import httpClient from "@/api/httpClient";

// Get all vendors (Active list)
export const getVendors = () => {
  return httpClient.get("/api/v1/vendors");
};

// Get vendor by ID
export const getVendorById = (id) => {
  return httpClient.get(`/api/v1/vendors/${id}`);
};

// Create vendor
export const createVendor = (data) => {
  return httpClient.post("/api/v1/vendors", data);
};

// Update vendor
export const updateVendor = (id, data) => {
  return httpClient.put(`/api/v1/vendors/${id}`, data);
};

// Delete vendor
export const deleteVendor = (id) => {
  return httpClient.delete(`/api/v1/vendors/${id}`);
};

// batch delete vendors
export const batchDeleteVendors = (ids) => {
  return httpClient.delete(`/api/v1/vendors/batch`, { data:  ids  }); 
};