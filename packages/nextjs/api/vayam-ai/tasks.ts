import api from ".";

export function getAllTasks() {
  return api.get("/task").then(response => response.data);
}
