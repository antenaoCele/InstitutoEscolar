import api from "../utils/api";

export const ScheduleStudentService = {
  getAll: () => api.get("/schedule_students"),
  getById: (id) => api.get(`/schedule_students/${id}`),
  create: (data) => api.post("/schedule_students", data),
  update: (id, data) => api.put(`/schedule_students/${id}`, data),
  delete: (id) => api.delete(`/schedule_students/${id}`),
};
