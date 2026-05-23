import api from "../utils/api";

export const studentTutorService = {
  getAll: () => api.get("/student_tutors"),

  getById: (id) => api.get(`/student_tutors/${id}`),

  create: (data) =>
    api.post("/student_tutors", {
      student_id: data.student_id,
      tutor_id: data.tutor_id,
    }),

  update: (id, data) =>
    api.put(`/student_tutors/${id}`, {
      student_id: data.student_id,
      tutor_id: data.tutor_id,
    }),

  delete: (id) => api.delete(`/student_tutors/${id}`),
};
