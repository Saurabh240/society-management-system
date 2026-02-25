import httpClient from "../../../api/httpClient";


const handleResponse = (response) => {
  if (response.data.success) {
    return response.data.data;
  } else {
    throw response.data;
  }
};


export const getUnitsByTenant = async () => {
  try {
    const response = await httpClient.get("/units");
    return handleResponse(response);
  } catch (error) {
    throw error.response?.data || {
      success: false,
      error: "Failed to fetch units",
      errorCode: "UNIT_ERROR",
    };
  }
};


export const getUnitsByProperty = async (propertyId) => {
  try {
    const response = await httpClient.get(
      `/units/property/${propertyId}`
    );
    return handleResponse(response);
  } catch (error) {
    throw error.response?.data || {
      success: false,
      error: "Failed to fetch units by property",
      errorCode: "UNIT_ERROR",
    };
  }
};


export const getUnit = async (id) => {
  try {
    const response = await httpClient.get(`/units/${id}`);
    return handleResponse(response);
  } catch (error) {
    throw error.response?.data || {
      success: false,
      error: "Failed to fetch unit",
      errorCode: "UNIT_ERROR",
    };
  }
};


export const createUnit = async (unitData) => {
  try {
    const response = await httpClient.post("/units", unitData);
    return handleResponse(response);
  } catch (error) {
    throw error.response?.data || {
      success: false,
      error: "Failed to create unit",
      errorCode: "UNIT_ERROR",
    };
  }
};


export const updateUnit = async (id, updateData) => {
  try {
    const response = await httpClient.patch(
      `/units/${id}`,
      updateData
    );
    return handleResponse(response);
  } catch (error) {
    throw error.response?.data || {
      success: false,
      error: "Failed to update unit",
      errorCode: "UNIT_ERROR",
    };
  }
};


export const updateOccupancy = async (id, occupancyStatus) => {
  try {
    const response = await httpClient.patch(
      `/units/${id}/occupancy`,
      { occupancyStatus }
    );
    return handleResponse(response);
  } catch (error) {
    throw error.response?.data || {
      success: false,
      error: "Failed to update occupancy",
      errorCode: "UNIT_ERROR",
    };
  }
};


export const deleteUnit = async (id) => {
  try {
    const response = await httpClient.delete(`/units/${id}`);
    return handleResponse(response);
  } catch (error) {
    throw error.response?.data || {
      success: false,
      error: "Failed to delete unit",
      errorCode: "UNIT_ERROR",
    };
  }
};