import api from ".";
import { Task } from "../../types/vayam-ai/Task";

export function getAllTasks() {
  return api.get("/task").then(response => response.data);
}

export function submitNewTask(data: { taskInfo: Task }) {
  return api.post("/task", data.taskInfo).then(response => response.data);
}
