import api from "../utils/api";

export const PaymentService = {
  getAll: () => api.get("/payments"),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post("/payments", data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  getMonthly: (month, year) =>
    api.get(`/payments/monthly?month=${month}&year=${year}`),
  getStudentPlans: (studentId) =>
    api.get(`/payments/student/${studentId}/plans`),

  // Aviso de duplicado (informativo, no bloquea). Llamalo antes de
  // confirmar el pago para mostrar la advertencia si corresponde.
  // excludeId: al editar un pago, pasá su propio id para que no se
  // compare contra sí mismo.
  checkDuplicate: (studentPlanId, paymentPeriod, excludeId = null) =>
    api.get(
      `/payments/check-duplicate?student_plan_id=${studentPlanId}&payment_period=${paymentPeriod}${
        excludeId ? `&exclude_id=${excludeId}` : ""
      }`,
    ),
};
