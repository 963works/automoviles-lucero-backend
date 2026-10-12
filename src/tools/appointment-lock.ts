// Bloqueo real para que la comprobación de hueco libre y la creación de la
// cita no puedan solaparse entre dos llamadas concurrentes (Sección 5 del
// encargo de festivos/reservas, 13/10/2026: "evitar dobles reservas" es
// crítico). El backend corre en una sola réplica (EasyPanel, replicas: 1),
// así que una cola en memoria del propio proceso es una solución real y
// completa para esta concurrencia -- no hace falta Redis ni una base de
// datos transaccional para el volumen real de un concesionario.
let queue: Promise<unknown> = Promise.resolve();

export function withAppointmentLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(fn, fn);
  queue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}
