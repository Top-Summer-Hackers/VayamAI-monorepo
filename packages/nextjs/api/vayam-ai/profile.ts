import api from ".";

export function getAllFreelancers() {
  return api.get("/freelancer").then(response => response.data);
}

export function getAllClients() {
  return api.get("/client").then(response => response.data);
}
