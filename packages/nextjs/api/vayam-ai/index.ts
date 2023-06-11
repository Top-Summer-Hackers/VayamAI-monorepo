import axios from "axios";

const api = axios.create({
  baseURL: "http://134.209.172.151:8090/api",
});

export default api;
