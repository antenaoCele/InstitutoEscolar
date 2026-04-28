export const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error al parsear user:", error);
    return null;
  }
};

export const isAdmin = () => {
  const user = getUser();

  if (!user || !user.role) return false;

  return user.role.toLowerCase() === "admin";
};
