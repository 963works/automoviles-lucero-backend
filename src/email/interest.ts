// Decide si un correo es de un cliente interesado antes de contestarlo.
// Reglas explícitas y auditables: lo que no encaja no recibe respuesta
// automática y pasa a revisión humana.

// Solo correo automático o masivo: no hay una persona al otro lado que
// pueda recibir una respuesta. Cualquier correo escrito por alguien se atiende.
const AUTOMATED_ONLY = [
  /\b(darse de baja|baja de (la )?lista|unsubscribe|dar de baja)\b/i,
  /\b(newsletter|boletín|webinar|promoci[oó]n de (lanzamiento|oferta)|descuento exclusivo)\b/i,
  // FALLO REAL detectado (15/10/2026): el propio Coches.net manda correos de
  // marketing/sugerencias ("comunicacion@...coches.net", "sugerencias@...")
  // con coches populares -- esto NO es un cliente real preguntando, es
  // publicidad del portal, y se coló porque mencionaba modelos de coches.
  /\b(los m[aá]s populares|no te quedes sin ellos|coches que viste|recomendados para ti|basado en tu b[uú]squeda)\b/i,
];

// Remitentes de marketing/boletín de los propios portales (nunca un cliente
// real detrás) -- se descarta por el remitente, sin depender de palabras
// concretas en el cuerpo.
const MARKETING_SENDER = /\b(comunicacion|sugerencias|newsletter|noticias|marketing)@/i;

// Bancos/entidades financieras y publicidad (a petición real, 15/10/2026,
// tras el fallo del bucle de autorespuesta): el agente de correo tiene
// PROHIBIDO contestar esto automáticamente, nunca, aunque mencione algo
// comercial de pasada -- siempre a revisión humana.
const BANK_OR_ADS = [
  /\b(banco|bbva|santander|caixabank|la caixa|ing direct|openbank|bankinter|unicaja|sabadell|revolut|n26|wise)\b/i,
  /\b(movimiento\s+bancario|extracto|saldo\s+de\s+tu\s+cuenta|cargo\s+en\s+tu\s+cuenta|transferencia\s+recibida|transferencia\s+enviada)\b/i,
  /\b(oferta\s+especial|black\s*friday|cyber\s*monday|c[oó]digo\s+promocional|rebajas|liquidaci[oó]n\s+total)\b/i,
  /\b(publicidad|marketing|campa[nñ]a\s+de\s+email)\b/i,
];

const INTERESTED = [
  /\b(coche|coches|veh[ií]culo|vehiculos|veh[ií]culos|furgoneta|furgonetas|todoterreno|suv|monovolumen|berlina|familiar|4x4)\b/i,
  /\b(precio|cu[aá]nto cuesta|cu[aá]nto vale|cu[aá]nto es|oferta|financ\w*|plazos|cuota)\b/i,
  /\b(cita|visitar|ver el|ver la|probar|prueba|quedar|pasar por|ir a ver)\b/i,
  /\b(reservar|reserva|apartar|se\s+lo\s+llevo|me lo llevo)\b/i,
  /\b(tasar|tasaci[oó]n|valorar|vender mi|quiero vender|compr\w*|busco)\b/i,
  /\b(disponible|kil[oó]metros|kms?|garant[ií]a|itv|matr[ií]cula|motor|diesel|gasolina|h[ií]brido|el[eé]ctrico)\b/i,
  /\b(golf|polo|astra|corsa|clio|megane|kuga|focus|qashqai|tiguan|x[1-7]|serie [1-7]|a[1-8]|c[1-5]|ibiza|leon|octavia|fiesta|tucson|sportage|berlingo|doblo|transit|jumper|ducato|vito|sprinter|passat|scenic|sc[eé]nic|touran|sharan|caddy|t-roc|t-cross|arona|ateca|kadjar|captur|duster|sandero|yaris|corolla|rav4|c-hr|juke|micra|mokka|crossland|grandland|peugeot|citro[eë]n|seat|renault|volkswagen|skoda|hyundai|kia|toyota|nissan|opel|dacia|fiat)\b/i,
  /\b(car|cars|van|vans|price|how much|appointment|finance|financing|test drive|buy|reserve|sell my car)\b/i,
];

// Plantillas propias de los portales (encargo real, 14/10/2026, caso real:
// un correo de "nuevo contacto" con nombre/teléfono/modelo NO llevaba
// ninguna palabra de la lista de arriba -- "Passat" no estaba en la lista
// de modelos, y aun así es un lead real de verdad, con teléfono incluido).
// Si el propio portal generó esta notificación, es por definición un
// interés comercial real -- no hace falta que coincida además con una
// palabra concreta.
const PORTAL_NOTIFICATION_TEMPLATE = [
  /\btienes un nuevo contacto\b/i,
  /\bnuevo contacto\b/i,
  /se ha interesado por/i,
  /contactado desde/i,
  /estos son sus datos de contacto/i,
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
// Orden importante: si el cuerpo menciona milanuncios/wallapop se etiqueta
// así aunque el correo llegue técnicamente desde el dominio de coches.net
// (comparten el mismo sistema de notificaciones) -- lo que importa al
// equipo es el anuncio real de origen, no quién reenvió el aviso.
const PORTAL_SENDERS: { match: RegExp; name: string }[] = [
  { match: /milanuncios/i, name: "Milanuncios" },
  { match: /wallapop/i, name: "Wallapop" },
  { match: /coches\.net/i, name: "Coches.net" },
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

export function decideInterest(input: { from: string; subject: string; text: string; hasPriorThread: boolean; isAllowedPortal: boolean }): InterestDecision {
  const body = `${input.subject}\n${input.text}`;
  if (SENSITIVE_DOCS.some((r) => r.test(body))) {
    return { interested: false, reason: "documento_sensible_revision_humana" };
  }
  if (MARKETING_SENDER.test(input.from)) {
    return { interested: false, reason: "remitente_marketing_portal" };
  }
  if (AUTOMATED_ONLY.some((r) => r.test(body))) {
    return { interested: false, reason: "correo_masivo_o_baja" };
  }
  if (BANK_OR_ADS.some((r) => r.test(body))) {
    return { interested: false, reason: "banco_o_publicidad_prohibido" };
  }
  // Decisión real del negocio (15/10/2026): el agente de correo SOLO
  // contesta automáticamente si el correo viene de Wallapop o Coches.net --
  // nunca por venir de cualquier otra dirección, por mucho que mencione
  // coches, precio, cita, etc. Si no es de uno de esos dos portales, se
  // registra para que lo vea el equipo, pero nunca se contesta solo.
  if (!input.isAllowedPortal) {
    return { interested: false, reason: "no_es_wallapop_ni_cochesnet" };
  }
  if (input.hasPriorThread) {
    return { interested: true, reason: "conversacion_previa" };
  }
  if (INTERESTED.some((r) => r.test(body))) {
    return { interested: true, reason: "pregunta_sobre_vehiculos_o_servicios" };
  }
  if (PORTAL_NOTIFICATION_TEMPLATE.some((r) => r.test(body))) {
    return { interested: true, reason: "notificacion_real_de_portal" };
  }
  return { interested: false, reason: "sin_tema_claro_revision_humana" };
}
