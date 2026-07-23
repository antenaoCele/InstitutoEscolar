import api from "../utils/api";

export const teacherLiquidationService = {
  getAll: () => api.get("/teacher_liquidations"),
  getById: (id) => api.get(`/teacher_liquidations/${id}`),
  getMonthly: (month, year) =>
    api.get("/teacher_liquidations/monthly", { params: { month, year } }),
};
