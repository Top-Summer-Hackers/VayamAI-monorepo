import api from ".";
import { Proposal } from "~~/types/vayam-ai/Proposal";

export function submitProposal(proposalData: { proposal: Proposal }) {
  return api.post("/proposal", proposalData.proposal).then(response => response.data);
}
