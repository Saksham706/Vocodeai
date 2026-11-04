import axios from "axios";
import { BACKEND_URL } from "../config/apiConfig";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true, 
});

export default api;