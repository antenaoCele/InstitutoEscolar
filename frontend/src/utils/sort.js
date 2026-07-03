export const sortByProperty = (property) => (a, b) =>
  (a[property] || "").localeCompare(b[property] || "", "es", {
    sensitivity: "base",
  });

export const sortByPersonName = (a, b) => {
  const lastName = (a.last_name || "").localeCompare(b.last_name || "", "es", {
    sensitivity: "base",
  });

  if (lastName !== 0) return lastName;

  return (a.first_name || "").localeCompare(b.first_name || "", "es", {
    sensitivity: "base",
  });
};
