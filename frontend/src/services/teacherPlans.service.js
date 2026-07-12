import api from "../utils/api";

export const teacherPlansService = {
  getAll: () => api.get("/teacher_plans"),

  getByPlan: (planId) => api.get(`/teacher_plans/plan/${planId}`),

  updateByPlan: (planId, data) =>
    api.put(`/teacher_plans/plan/${planId}`, data),
};
