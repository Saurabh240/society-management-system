import httpClient from "../../api/httpClient";


export const createUnit = (data) => {
  return httpClient.post("/units", data);
};



export const getUnitById = (unitId) => {
  return httpClient.get(`/units/${unitId}`);
};



export const getUnitsByAssociation = (associationId) => {
  return httpClient.get(`/units/association/${associationId}`);
};



export const getAllUnits = () => {
  return httpClient.get("/units");
};



export const updateUnit = (unitId, data) => {
  return httpClient.patch(`/units/${unitId}`, data);
};


export const deleteUnit = (unitId) => {
  return httpClient.delete(`/units/${unitId}`);
};



export const updateUnitOccupancy = (unitId, occupancyStatus) => {
  return httpClient.patch(`/units/${unitId}/occupancy`, {
    occupancyStatus,
  });
};