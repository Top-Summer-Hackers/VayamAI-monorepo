import api from ".";

export function getAllDeals() {
  return api.get("/deal").then(response => response.data);
}
