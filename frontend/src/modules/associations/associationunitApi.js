

export const getAssociationUnits = (params) =>
  axios.get("/association-units", { params });

export const createAssociationUnit = (data) =>
  axios.post("/association-units", data);

export const updateAssociationUnit = (id, data) =>
  axios.put(`/association-units/${id}`, data);

export const deleteAssociationUnit = (id) =>
  axios.delete(`/association-units/${id}`);