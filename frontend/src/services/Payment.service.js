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
};
