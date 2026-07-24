import api from "../utils/api";

export const teacherService = {
  getAll: (params = {}) => api.get("/teachers", { params }),

  getById: (id) => api.get(`/teachers/${id}`),

  reactivate: (id) => api.put(`/teachers/${id}/reactivate`),

  getAvailableStudents(id, planId) {
    return api.get(`/teachers/${id}/students`, {
      params: {
        plan_id: planId,
      },
    });
  },

  getAvailablePlans: (teacherId) => api.get(`/teachers/${teacherId}/plans`),

  getTeachersByPlan(planId) {
    return api.get("/teachers", {
      params: {
        plan_id: planId,
      },
    });
  },

  create: (data) => api.post("/teachers", data),

  update: (id, data) => api.put(`/teachers/${id}`, data),

  delete: (id) => api.delete(`/teachers/${id}`),
};
