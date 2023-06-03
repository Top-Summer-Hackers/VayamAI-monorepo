import api from ".";

export function getAllDeals() {
  return api.get("/deal").then(response => response.data);
}

export function updateDeal(data: { dealId: string; invoiceAddr: string }) {
  return api.patch(`/deal/${data.dealId}/${data.invoiceAddr}`).then(response => response.data);
}
