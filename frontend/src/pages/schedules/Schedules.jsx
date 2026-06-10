import { useLocation } from "react-router-dom";
import MonthlyCalendar from "./MonthlyCalendar";
import WeeklyCalendar from "./WeeklyCalendar";

export function Schedules() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  const view = params.get("view") || "weekly";

  return <>{view === "weekly" ? <WeeklyCalendar /> : <MonthlyCalendar />}</>;
}

export default Schedules;
