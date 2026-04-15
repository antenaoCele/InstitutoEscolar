import api from "../utils/api";

export const PlanSubjectService = {
  getAll: () => api.get("/plan_subjects"),
  getById: (id) => api.get(`/plan_subjects/${id}`),
  create: (data) => api.post("/plan_subjects", data),
  update: (id, data) => api.put(`/plan_subjects/${id}`, data),
  delete: (id) => api.delete(`/plan_subjects/${id}`),
};
