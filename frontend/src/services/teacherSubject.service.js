import api from "../utils/api";

export const teacherSubjectService = {
  getAll: () => api.get("/teacher_subjects"),
  getById: (id) => api.get(`/teacher_subjects/${id}`),
  create: (data) => api.post("/teacher_subjects", data),
  update: (id, data) => api.put(`/teacher_subjects/${id}`, data),
  delete: (id) => api.delete(`/teacher_subjects/${id}`),
};
