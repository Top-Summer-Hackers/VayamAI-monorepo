import api from ".";
import { RegisterAsProvider } from "~~/types/vayam-ai/RegisterAsProvider";

export function registerAsProvider(registerInfo: RegisterAsProvider) {
  return api.post("/auth/users/", registerInfo).then(response => response.data);
}
