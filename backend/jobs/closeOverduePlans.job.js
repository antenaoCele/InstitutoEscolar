import cron from "node-cron";
import { closeOverduePlansPastGracePeriod } from "../services/payments.service.js";

// Corre todos los días a las 03:00 (horario de bajo uso). Si ya
// tenés otro cron en el proyecto (ej. el de closeYear), fijate el
// horario que usa ahí para no pisarse ni sobrecargar la base a la
// misma hora.
export function scheduleCloseOverduePlans() {
  cron.schedule("0 3 * * *", async () => {
    try {
      const closed = await closeOverduePlansPastGracePeriod();

      console.log(
        `[closeOverduePlans] Se dieron de baja ${closed.length} plan(es) por deuda no regularizada a tiempo.`,
        closed,
      );
    } catch (error) {
      console.error("[closeOverduePlans] Error al ejecutar el cron:", error);
    }
  });
}
