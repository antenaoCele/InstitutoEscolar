import api from "../utils/api";

export const planService = {
  getAll: (params = {}) => api.get("/plans", { params }),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post("/plans", data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};
