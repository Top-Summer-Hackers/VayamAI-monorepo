export type RegisterAsProvider = {
  _id: string;
  user_name: string;
  description: string;
  password: string;
};

export type LoginCredential = {
  user_name: string;
  password: string;
  role: string;
};
