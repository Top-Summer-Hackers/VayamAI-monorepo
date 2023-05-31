import api from ".";
import { RegisterAsProvider } from "~~/types/vayam-ai/RegisterAsProvider";

export function registerAsFreelancer(registerInfo: RegisterAsProvider) {
  return api.post("/freelancer", registerInfo).then(response => response.data);
}

export function registerAsClient(registerInfo: RegisterAsProvider) {
  return api.post("/client", registerInfo).then(response => response.data);
}
