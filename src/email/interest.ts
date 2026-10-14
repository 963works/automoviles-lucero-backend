// Decide si un correo es de un cliente interesado antes de contestarlo.
// Reglas explícitas y auditables: lo que no encaja no recibe respuesta
// automática y pasa a revisión humana.

// Solo correo automático o masivo: no hay una persona al otro lado que
// pueda recibir una respuesta. Cualquier correo escrito por alguien se atiende.
const AUTOMATED_ONLY = [
  /\b(darse de baja|baja de (la )?lista|unsubscribe|dar de baja)\b/i,
  /\b(newsletter|boletín|webinar|promoci[oó]n de (lanzamiento|oferta)|descuento exclusivo)\b/i,
];

const INTERESTED = [
  /\b(coche|coches|veh[ií]culo|vehiculos|veh[ií]culos|furgoneta|furgonetas|todoterreno|suv|monovolumen|berlina|familiar|4x4)\b/i,
  /\b(precio|cu[aá]nto cuesta|cu[aá]nto vale|cu[aá]nto es|oferta|financ\w*|plazos|cuota)\b/i,
  /\b(cita|visitar|ver el|ver la|probar|prueba|quedar|pasar por|ir a ver)\b/i,
  /\b(reservar|reserva|apartar|se\s+lo\s+llevo|me lo llevo)\b/i,
  /\b(tasar|tasaci[oó]n|valorar|vender mi|quiero vender|compr\w*|busco)\b/i,
  /\b(disponible|kil[oó]metros|kms?|garant[ií]a|itv|matr[ií]cula|motor|diesel|gasolina|h[ií]brido|el[eé]ctrico)\b/i,
  /\b(golf|polo|astra|corsa|clio|megane|kuga|focus|qashqai|tiguan|x[1-7]|serie [1-7]|a[1-8]|c[1-5]|ibiza|leon|octavia|fiesta|tucson|sportage|berlingo|doblo|transit|jumper|ducato|vito|sprinter)\b/i,
  /\b(car|cars|van|vans|price|how much|appointment|finance|financing|test drive|buy|reserve|sell my car)\b/i,
];

// Documentación sensible (encargo real, 14/10/2026): nunca se contesta
// automáticamente aunque el correo también mencione algo comercial de
// pasada -- se revisa a mano, sin tocar ni procesar esos documentos.
const SENSITIVE_DOCS = [
  /\b(factura|facturaci[oó]n|albar[aá]n)\b/i,
  /\b(n[oó]mina|n[oó]minas|seguridad social)\b/i,
  /\b(extracto\s+bancario|iban\b|n[uú]mero\s+de\s+cuenta|tarjeta\s+de\s+cr[eé]dito)\b/i,
  /\b(dni|n[ieí]e|pasaporte|documento\s+de\s+identidad)\b/i,
  /\b(contrato\s+(de\s+)?(trabajo|arrendamiento|alquiler|laboral))\b/i,
];

// Portales de compraventa (encargo real, 14/10/2026): se detecta el origen
// para dejarlo registrado en el CRM, y sobre todo para distinguir el caso
// en que el propio portal exige responder desde su chat/app -- contestar
// por correo a esa notificación no le llega de verdad al comprador.
const PORTAL_SENDERS: { match: RegExp; name: string }[] = [
  { match: /coches\.net/i, name: "Coches.net" },
  { match: /milanuncios\.com/i, name: "Milanuncios" },
  { match: /wallapop\.com/i, name: "Wallapop" },
];
const PORTAL_MANAGE_ELSEWHERE = [
  /gestionar\s+(el\s+)?chat/i,
  /responde(r)?\s+desde\s+la\s+app/i,
  /ver\s+(el\s+)?mensaje\s+en\s+(la\s+)?(app|plataforma|web)/i,
  /abre\s+la\s+app\s+para\s+responder/i,
  /descarga\s+la\s+app/i,
];

export type PortalInfo = { portal: string | null; mustManageOnPortal: boolean };

export function detectPortal(input: { from: string; subject: string; text: string }): PortalInfo {
  const hay = `${input.from}\n${input.subject}\n${input.text}`;
  const found = PORTAL_SENDERS.find((p) => p.match.test(hay));
  return {
    portal: found?.name ?? null,
    mustManageOnPortal: PORTAL_MANAGE_ELSEWHERE.some((r) => r.test(input.text)),
  };
}

export type InterestDecision = { interested: boolean; reason: string };

export function decideInterest(input: { subject: string; text: string; hasPriorThread: boolean }): InterestDecision {
  const body = `${input.subject}\n${input.text}`;
  if (SENSITIVE_DOCS.some((r) => r.test(body))) {
    return { interested: false, reason: "documento_sensible_revision_humana" };
  }
  if (AUTOMATED_ONLY.some((r) => r.test(body))) {
    return { interested: false, reason: "correo_masivo_o_baja" };
  }
  if (input.hasPriorThread) {
    return { interested: true, reason: "conversacion_previa" };
  }
  if (INTERESTED.some((r) => r.test(body))) {
    return { interested: true, reason: "pregunta_sobre_vehiculos_o_servicios" };
  }
  // 13/10/2026, decisión del negocio: el agente de correo solo responde
  // automáticamente consultas de ventas/vehículos, reservas, citas/visitas
  // o información del negocio -- nada más se marca como interesado por
  // defecto. Esto SÍ coincide por fin con lo que ya decía el comentario de
  // cabecera de este archivo ("lo que no encaja... pasa a revisión
  // humana") -- antes el código hacía justo lo contrario. Un correo sin
  // tema claro (candidatos a trabajo, prensa, proveedores, spam real que
  // no cayó en AUTOMATED_ONLY) queda registrado en email_inbox/CRM
  // (/crm/pendientes) para que el equipo lo vea y conteste si hace falta
  // -- nunca se contesta solo ni se pierde.
  return { interested: false, reason: "sin_tema_claro_revision_humana" };
}
