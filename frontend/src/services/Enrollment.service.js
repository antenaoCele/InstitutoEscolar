import api from "../utils/api";

export const EnrollmentService = {
  getAll: () => api.get("/enrollments"),
  getById: (id) => api.get(`/enrollments/${id}`),
  create: (data) => api.post("/enrollments", data),
  update: (id, data) => api.put(`/enrollments/${id}`, data),
  delete: (id) => api.delete(`/enrollments/${id}`),
};