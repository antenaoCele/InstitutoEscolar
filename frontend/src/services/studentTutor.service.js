import api from "../utils/api";

export const studentTutorService = {
  getAll: () => api.get("/student_tutors"),
  getById: (id) => api.get(`/student_tutors/${id}`),
  create: (data) => api.post("/student_tutors", data),
  update: (id, data) => api.put(`/student_tutors/${id}`, data),
  delete: (id) => api.delete(`/student_tutors/${id}`),
};
