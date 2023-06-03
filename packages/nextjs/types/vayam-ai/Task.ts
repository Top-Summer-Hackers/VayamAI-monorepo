export type Task = {
  title: string;
  description: string;
  skills: string[];
  bounty: number;
  start_time: string;
  deadline: string;
};

export type TaskList = {
  id: string;
  bounty: number;
  deadline: string;
  description: string;
  proposals: [];
  skills: string[];
  start_time: string;
  title: string;
};

export type TaskItem = {
  bounty: number;
  client_id: string;
  deadline: string;
  description: string;
  id: string;
  proposals_id: string[];
  skills: string[];
  start_time: string;
  title: string;
};
