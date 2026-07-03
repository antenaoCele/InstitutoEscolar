import api from "../utils/api";

export const studentService = {
  getAll: (params = {}) => api.get("/students", { params }),

  getActiveStudents: () => api.get("/students/active"),

  getById: (id) => api.get(`/students/${id}`),

  getInfo: (id) => api.get(`/students/${id}/info`),

  getPlans: (studentId, teacherId) =>
    api.get(`/students/${studentId}/plans`, {
      params: {
        teacher_id: teacherId,
      },
    }),

  create: (data) => api.post("/students", data),

  createWithPlan: (data) => api.post("/students", data),

  update: (id, data) => api.put(`/students/${id}`, data),

  delete: (id) => api.delete(`/students/${id}`),
};
