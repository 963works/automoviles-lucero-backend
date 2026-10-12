import { businessInfo } from "../data/business-info.js";
import { envelope } from "../response.js";
import { isWithinBusinessHoursNow } from "./appointments.js";

export function getBusinessInfo() {
  return envelope({
    status: "ok",
    data: {
      ...businessInfo,
      // Calculado en tiempo real (Europe/Madrid) -- nunca lo adivines tú,
      // úsalo para decidir si intentar una transferencia en vivo o no
      // (Sección 5 del encargo de conexión telefónica, 13/10/2026).
      is_business_hours_now: isWithinBusinessHoursNow(),
    },
    source: "Especificación maestra de producción confirmada por el responsable del negocio, 29/09/2026. Campos individuales llevan su propio validation_status.",
    source_updated_at: "2026-09-29",
  });
}
