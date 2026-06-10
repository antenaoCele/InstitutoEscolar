import api from "../utils/api";

export const studentService = {
  getAll: (params = {}) => api.get("/students", { params }),
  getById: (id) => api.get(`/students/${id}`),
  getPlans: (studentId, teacherId) =>
    api.get(`/students/${studentId}/plans`, {
      params: {
        teacher_id: teacherId,
      },
    }),
  create: (data) => api.post("/students", data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};
