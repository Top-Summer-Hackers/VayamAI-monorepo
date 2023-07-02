import api from ".";
import { SubmitMilestone, SunmitProposal } from "~~/types/vayam-ai/Proposal";

export function getAllMilestones() {
  return api.get("/milestone").then(response => response.data);
}

export function submitProposal(proposalData: { proposal: SunmitProposal }) {
  return api.post("/proposal", proposalData.proposal).then(response => response.data);
}

export function submitMilestones(miltstoneData: { miltstone: SubmitMilestone[] }) {
  return api.post("/milestone", miltstoneData.miltstone).then(response => response.data);
}
