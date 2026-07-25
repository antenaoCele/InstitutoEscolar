export function getCurrentDateParts() {
  const today = new Date();

  return {
    today,
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    yearMonth: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0",
    )}`,
    date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(today.getDate()).padStart(2, "0")}`,
  };
}
