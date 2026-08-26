export const formatDate = (date) => {
  if (!date) return "-";

  const datePart = String(date).split("T")[0];
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) {
    return "-";
  }

  return `${day}/${month}/${year}`;
};
