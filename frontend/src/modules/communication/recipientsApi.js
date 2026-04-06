

import httpClient from "../../api/httpClient";
// GET RECIPIENT OPTIONS
export const getRecipientOptions = (associationId) =>
  httpClient.get("/api/v1/communications/recipients/options", {
    params: { associationId },
  });

  //GET OWNERS
export const getOwners = (associationId) =>
  httpClient.get("/api/v1/communications/owners", {
    params: { associationId },
  });