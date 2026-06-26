import api from "../utils/api";

export const teacherService = {
  getAll: (params = {}) => api.get("/teachers", { params }),

  getById: (id) => api.get(`/teachers/${id}`),

  getAvailableStudents: (teacherId) =>
    api.get(`/teachers/${teacherId}/students`),

  getAvailablePlans: (teacherId) => api.get(`/teachers/${teacherId}/plans`),

  create: (data) => api.post("/teachers", data),

  update: (id, data) => api.put(`/teachers/${id}`, data),

  delete: (id) => api.delete(`/teachers/${id}`),
};
