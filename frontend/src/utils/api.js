import axios from "axios";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// =========================
// REQUEST
// =========================
api.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...getAuthHeaders(),
  };
  return config;
});

// =========================
// RESPONSE
// =========================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401 && url !== "/login") {
      window.dispatchEvent(new Event("sessionExpired"));
    }

    return Promise.reject(error);
  },
);

export default api;
