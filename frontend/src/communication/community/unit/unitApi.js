
import httpClient from "../../../api/httpClient";

const handleResponse = (response) => {
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.error || "Something went wrong");
};

const handleApiError = (error) => {
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw new Error("Something went wrong");
};


export const getUnitsByTenant = async () => {
  try {
    const response = await httpClient.get("/units");
    return handleResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};

export const getUnitsByCommunity = async (communityId) => {
  try {
    const response = await httpClient.get(
      `/units/community/${communityId}`
    );
    return handleResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};


export const createUnit = async (unitData) => {
  try {
    const response = await httpClient.post("/units", unitData);
    return handleResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};


export const updateUnit = async (id, updateData) => {
  try {
    const response = await httpClient.patch(`/units/${id}`, updateData);
    return handleResponse(response);
  } catch (error) {
    handleApiError(error);
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
    handleApiError(error);
  }
};

export const deleteUnit = async (id) => {
  try {
    const response = await httpClient.delete(`/units/${id}`);
    return handleResponse(response);
  } catch (error) {
    handleApiError(error);
  }
};