import api from "../utils/api";

export const MonthlyFinanceService = {
  getAll: () => api.get("/monthly_finances"),
  getById: (id) => api.get(`/monthly_finances/${id}`),
  create: (data) => api.post("/monthly_finances", data),
  update: (id, data) => api.put(`/monthly_finances/${id}`, data),
  delete: (id) => api.delete(`/monthly_finances/${id}`),
};
