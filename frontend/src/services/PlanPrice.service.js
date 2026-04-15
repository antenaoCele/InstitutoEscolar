import api from "../utils/api";

export const PlanPriceService = {
  getAll: () => api.get("/plan_prices"),
  getById: (id) => api.get(`/plan_prices/${id}`),
  create: (data) => api.post("/plan_prices", data),
  update: (id, data) => api.put(`/plan_prices/${id}`, data),
  delete: (id) => api.delete(`/plan_prices/${id}`),
};
