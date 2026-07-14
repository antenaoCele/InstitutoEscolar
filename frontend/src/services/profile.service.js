import api from "../utils/api";

export const profileService = {
  getMe: () => api.get("/me"),
  updateMe: (data) => api.put("/me", data),
  changePassword: (data) => api.put("/me/password", data),
};
