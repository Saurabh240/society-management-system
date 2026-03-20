import httpClient from "../../api/httpClient";

export const createUnit          = (data)              => httpClient.post("/api/v1/units", data);
export const getUnitById         = (unitId)            => httpClient.get(`/api/v1/units/${unitId}`);
export const getUnitsByAssociation = (associationId)   => httpClient.get(`/api/v1/units/association/${associationId}`);
export const getAllUnits          = ()                  => httpClient.get("/api/v1/units");
export const updateUnit          = (unitId, data)      => httpClient.patch(`/api/v1/units/${unitId}`, data);
export const deleteUnit          = (unitId)            => httpClient.delete(`/api/v1/units/${unitId}`);
export const updateUnitOccupancy = (unitId, occupancyStatus) =>
  httpClient.patch(`/api/v1/units/${unitId}/occupancy`, { occupancyStatus });