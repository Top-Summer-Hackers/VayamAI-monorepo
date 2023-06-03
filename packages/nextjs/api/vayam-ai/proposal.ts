import api from ".";

export function getAllProposals() {
  return api.get("/proposal").then(response => response.data);
}

export function approveProposal(proposalId: string) {
  return api.patch(`/proposal/${proposalId}`).then(response => response.data);
}
