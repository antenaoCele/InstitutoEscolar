import api from "../utils/api";

export const ScheduleService = {
  getAll: () => api.get("/schedules"),
  getById: (id) => api.get(`/schedules/${id}`),
  getInfo: (id) => api.get(`/schedules/info/${id}`),
  create: (data) => api.post("/schedules", data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
};
