import api from "../utils/api";

export const DashboardService = {
  getStats: () => api.get("/dashboard"),
};
