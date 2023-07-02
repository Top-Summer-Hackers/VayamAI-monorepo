import axios from "axios";

const api = axios.create({
  // baseURL: "http://134.209.172.151:8080/api",
  baseURL: "http://localhost:8080/api",
});

export default api;
