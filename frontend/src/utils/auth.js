export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === "admin";
};
