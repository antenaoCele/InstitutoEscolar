// export const getAuthHeaders = () => {
//   const token = localStorage.getItem("token");

//   return {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };
// };

import axios from "axios";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const api = axios.create({
  baseURL: "http://localhost:3000", // RUTA BASE
});

//Antes de enviar cualquier peticion se agregan los headers
api.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...getAuthHeaders(),
  };
  return config;
});

export default api;
