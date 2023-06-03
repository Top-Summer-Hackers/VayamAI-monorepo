export type Milestone = {
  description: string;
  price: number;
  deadline: string;
};

export type Proposal = {
  accepted?: boolean;
  client_id: string;
  task_id: string;
  freelancer_id: string;
  milestones: Milestone[];
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
  price: number;
  milestones: Milestone[];
};
