import api from "../utils/api";

export const studentPlanService = {
  getAll: () => api.get("/student_plans"),
  getById: (id) => api.get(`/student_plans/${id}`),
  create: (data) => api.post("/student_plans", data),
  update: (id, data) => api.put(`/student_plans/${id}`, data),
  delete: (id) => api.delete(`/student_plans/${id}`),
  changeTeacher: (id, teacher_id) =>
    api.put(`/student_plans/${id}/change-teacher`, { teacher_id }),

  // Olvidar deuda de una inscripción dada de baja (solo ADMIN). Sin
  // body: el backend valida que esté de baja y que tenga deuda.
  forgiveDebt: (id) => api.put(`/student_plans/${id}/forgive-debt`),

  // Estado de un plan puntual (académico + de cuenta + período a pagar).
  // Lo usa el formulario de pagos para saber si corresponde NORMAL o
  // REGULARIZATION, y qué payment_period mandar.
  getStatus: (id) => api.get(`/student_plans/${id}/status`),
};
