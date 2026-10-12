// Festivos reales de la Comunidad de Madrid para 2026 -- fuente oficial,
// no inventados ni aproximados:
// BOCM núm. 306, 24/12/2025 (Decreto 75/2025 del Consejo de Gobierno,
// 24/09/2025, fiestas laborales de la Comunidad de Madrid para 2026) +
// Resolución de 2/12/2025 de la Dirección General de Trabajo (fiestas
// locales, municipio de Madrid capital).
// https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/24/BOCM-20251224-1.PDF
//
// Mantenimiento: esta lista es solo de 2026. Hay que añadir el calendario
// de 2027 (mismo BOCM, normalmente se publica a finales de 2026) antes de
// que termine el año -- si isMadridHoliday() no encuentra el año, NO
// inventa que un día es festivo ni que no lo es, simplemente no lo marca
// (ver comentario en isMadridHoliday).
export const MADRID_HOLIDAYS_2026: string[] = [
  "2026-01-01", // Año Nuevo
  "2026-01-06", // Epifanía del Señor
  "2026-04-02", // Jueves Santo
  "2026-04-03", // Viernes Santo
  "2026-05-01", // Fiesta del Trabajo
  "2026-05-02", // Fiesta de la Comunidad de Madrid
  "2026-05-15", // San Isidro Labrador (fiesta local, Madrid capital)
  "2026-08-15", // Asunción de la Virgen
  "2026-10-12", // Fiesta Nacional de España
  "2026-11-02", // Traslado de Todos los Santos
  "2026-11-09", // Nuestra Señora de la Almudena (fiesta local, Madrid capital)
  "2026-12-07", // Traslado del Día de la Constitución Española
  "2026-12-08", // Día de la Inmaculada Concepción
  "2026-12-25", // Natividad del Señor
];

export function isMadridHoliday(dateStr: string): boolean {
  return MADRID_HOLIDAYS_2026.includes(dateStr);
}
