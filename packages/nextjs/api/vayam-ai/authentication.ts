import api from ".";
import { LoginCredential, RegisterAsProvider } from "~~/types/vayam-ai/RegisterAsProvider";

export function registerAsFreelancer(registerInfo: RegisterAsProvider) {
  return api.post("/freelancer", registerInfo).then(response => response.data);
}

export function registerAsClient(registerInfo: RegisterAsProvider) {
  return api.post("/client", registerInfo).then(response => response.data);
}

export function login(loginInfo: LoginCredential) {
  return api.post("/login", loginInfo).then(response => response.data);
}
