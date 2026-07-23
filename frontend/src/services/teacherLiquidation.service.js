import api from "../utils/api";

export const teacherLiquidationService = {
  getAll: () => api.get("/teacher-liquidations"),
  getById: (id) => api.get(`/teacher-liquidations/${id}`),
  getMonthly: (month, year) =>
    api.get("/teacher-liquidations/monthly", { params: { month, year } }),
};
