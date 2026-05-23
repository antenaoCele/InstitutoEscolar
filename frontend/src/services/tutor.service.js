import api from "../utils/api";

export const tutorService = {
  getAll: (params = {}) => api.get("/tutors", { params }),

  getById: (id) => api.get(`/tutors/${id}`),

  create: (data) =>
    api.post("/tutors", {
      first_name: data.first_name,
      last_name: data.last_name,
      dni: data.dni,
      phone: data.phone,
    }),

  update: (id, data) =>
    api.put(`/tutors/${id}`, {
      first_name: data.first_name,
      last_name: data.last_name,
      dni: data.dni,
      phone: data.phone,
    }),

  delete: (id) => api.delete(`/tutors/${id}`),
};
