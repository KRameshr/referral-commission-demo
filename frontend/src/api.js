import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://referral-commission-backend.vercel.app/api",
});

export const setToken = (t) =>
  t
    ? (api.defaults.headers.common.Authorization = `Bearer ${t}`)
    : delete api.defaults.headers.common.Authorization;

export default api;
