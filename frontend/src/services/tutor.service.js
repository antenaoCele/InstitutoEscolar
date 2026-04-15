import api from "../utils/api";

export const tutorService = {
  getAll: () => api.get("/tutors"),
  getById: (id) => api.get(`/tutors/${id}`),
  create: (data) => api.post("/tutors", data),
  update: (id, data) => api.put(`/tutors/${id}`, data),
  delete: (id) => api.delete(`/tutors/${id}`),
};
