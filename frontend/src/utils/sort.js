export const sortByName = (a, b) =>
  (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" });

export const sortByLastName = (a, b) =>
  (a.last_name || "").localeCompare(b.last_name || "", "es", {
    sensitivity: "base",
  }) ||
  (a.first_name || "").localeCompare(b.first_name || "", "es", {
    sensitivity: "base",
  });
