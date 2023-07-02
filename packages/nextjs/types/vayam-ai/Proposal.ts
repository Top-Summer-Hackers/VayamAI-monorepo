export type SubmitMilestone = {
  proposal_id: string;
  description: string;
  price: number;
  deadline: string;
};

export type Milestone = {
  description: string;
  price: number;
  deadline: string;
  id: string;
  link: string;
};

export type SunmitProposal = {
  client_id: string;
  task_id: string;
  freelancer_id: string;
};

export type Proposal = {
  accepted?: boolean;
  client_id: string;
  task_id: string;
  freelancer_id: string;
  milestones_id: Milestone[];
  price?: number;
  id?: string;
};

export type MilestoneItem = {
  description: string;
  price: number;
  deadline: string;
  status: string;
};

export type ProposalItem = {
  id: string;
  accepted: boolean;
  client_id: string;
  freelancer_id: string;
  task_id: string;
  proposal_price: number;
  milestones: Milestone[];
};
