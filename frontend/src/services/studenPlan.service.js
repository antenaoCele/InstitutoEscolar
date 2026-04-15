import api from "../utils/api";

export const studentPlanService = {
  getAll: () => api.get("/student_plans"),
  getById: (id) => api.get(`/student_plans/${id}`),
  create: (data) => api.post("/student_plans", data),
  update: (id, data) => api.put(`/student_plans/${id}`, data),
  delete: (id) => api.delete(`/student_plans/${id}`),
};
