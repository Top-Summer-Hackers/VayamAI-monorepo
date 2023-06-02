export type Milestone = {
  description: string;
  price: number;
  deadline: string;
};

export type Proposal = {
  task_id: string;
  freelancer_id: string;
  milestones: Milestone[];
};
