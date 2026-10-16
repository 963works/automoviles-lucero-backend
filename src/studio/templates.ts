// Las 10 plantillas de Lucero Studio AI (16/10/2026, a petición real: "vamos
// a construir el agente de imágenes de higgsfield... lo demás hazlo tú";
// ampliado el mismo día: "que ellos puedan elegir el tipo de vídeo... el
// tipo de modelo... una sección para prompt manual").
//
// Ramón y José nunca escriben un prompt desde cero: eligen plantilla, coche
// y, si quieren, motor/estilo/duración -- el sistema construye el prompt
// final. El prompt manual (opcional) se AÑADE al final del prompt
// automático, nunca lo sustituye, para no perder las reglas de seguridad
// de BASE_STYLE (no inventar matrícula, no inventar marca).
//
// Todos los parámetros de abajo (motores, duración, cfg_scale, relación de
// aspecto) están confirmados de verdad contra el openapi.json oficial de
// Higgsfield -- no son una suposición. No se usan Kling 3.0/Wan/Marketing
// Studio Image: solo aparecían nombrados en la página de precios, sin ruta
// de API confirmada, y arriesgar dinero real contra una ruta adivinada no
// compensa.

export type StudioKind = "image" | "video";

export type StudioTemplate = {
  id: string;
  label: string;
  description: string;
  kind: StudioKind;
  needsPhoto: boolean;
  // Nota real de riesgo heredada de la investigación (algunos modelos de
  // vídeo reducen la imagen de entrada antes de generar, lo que puede
  // volver ilegible una matrícula o un logo en un plano muy cercano).
  warning?: string;
  buildPrompt: (vehicleLabel: string, extra?: string) => string;
};

const BASE_STYLE =
  "fotografía publicitaria de concesionario de coches, iluminación limpia y realista, nada de texto ni logotipos añadidos por la IA, nunca inventar matrícula ni marca distinta a la real";

// ---------- motores de vídeo (confirmados en el openapi.json real) ----------
export type VideoEngine = {
  id: string;
  label: string;
  imageToVideoPath: string;
  textToVideoPath: string | null; // null = este motor/nivel no ofrece texto-a-vídeo
  durations: [number, number]; // [corta, larga], en segundos -- valores reales que acepta la API
  supportsCfgScale: boolean; // Kling sí tiene cfg_scale; Minimax no
};

export const VIDEO_ENGINES: VideoEngine[] = [
  {
    id: "kling_standard",
    label: "Kling estándar — el más rápido y económico",
    imageToVideoPath: "kling-video/v2.5-turbo/standard/image-to-video",
    textToVideoPath: null,
    durations: [5, 10],
    supportsCfgScale: true,
  },
  {
    id: "kling_pro",
    label: "Kling Pro — más calidad de imagen, cuesta más",
    imageToVideoPath: "kling-video/v2.5-turbo/pro/image-to-video",
    textToVideoPath: "kling-video/v2.5-turbo/pro/text-to-video",
    durations: [5, 10],
    supportsCfgScale: true,
  },
  {
    id: "minimax",
    label: "Minimax Hailuo — otro motor, movimiento distinto",
    imageToVideoPath: "minimax/hailuo-2.3/standard/image-to-video",
    textToVideoPath: "minimax/hailuo-2.3/standard/text-to-video",
    durations: [6, 10],
    supportsCfgScale: false,
  },
];

export function findVideoEngine(id: string): VideoEngine | undefined {
  return VIDEO_ENGINES.find((e) => e.id === id);
}

// Estilo = palabras en el prompt + cfg_scale (cuanto más bajo, más libertad
// creativa toma el modelo frente al prompt -- cuanto más alto, más se
// ciñe literalmente a lo que se le pide). No existe un parámetro "style"
// real en la API: esto es la forma honesta de aproximarlo con lo que sí
// existe de verdad.
export type VideoStyle = { id: string; label: string; promptSuffix: string; cfgScale: number };
export const VIDEO_STYLES: VideoStyle[] = [
  {
    id: "normal",
    label: "Normal — anuncio limpio y directo",
    promptSuffix: "estilo anuncio de concesionario limpio y directo, iluminación natural de día",
    cfgScale: 0.65,
  },
  {
    id: "cinematico",
    label: "Cinematográfico — más dramático, cámara elegante",
    promptSuffix: "estilo cinematográfico, iluminación dramática con contraste, movimiento de cámara suave y elegante, sensación de spot publicitario de alta gama",
    cfgScale: 0.35,
  },
];

export function findVideoStyle(id: string): VideoStyle | undefined {
  return VIDEO_STYLES.find((s) => s.id === id) ?? VIDEO_STYLES[0];
}

// ---------- relación de aspecto de imagen (confirmada en el openapi.json: enum real de Soul) ----------
export const IMAGE_ASPECT_RATIOS: { id: string; label: string }[] = [
  { id: "4:3", label: "Horizontal clásico (4:3)" },
  { id: "16:9", label: "Horizontal ancho (16:9) — web, Facebook" },
  { id: "1:1", label: "Cuadrado (1:1) — feed de Instagram" },
  { id: "9:16", label: "Vertical (9:16) — Stories, Reels, TikTok" },
  { id: "3:4", label: "Vertical clásico (3:4)" },
];

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  {
    id: "llegada",
    label: "Ha llegado",
    description: "Primer post cuando entra un coche al stock -- la cámara gira despacio alrededor del vehículo.",
    kind: "video",
    needsPhoto: true,
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo publicitario de "ha llegado": la cámara gira lento 360° alrededor del ${v}, mostrando el coche entero con orgullo, como el primer vistazo a un coche recién llegado al concesionario.`,
  },
  {
    id: "paseo-exterior",
    label: "Paseo exterior",
    description: "Barrido lateral cinematográfico del coche en el patio o la calle.",
    kind: "video",
    needsPhoto: true,
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo cinematográfico: la cámara se desplaza lateralmente, despacio, a lo largo del ${v} parado, destacando la carrocería y la silueta del vehículo.`,
  },
  {
    id: "detalle-interior",
    label: "Detalle interior",
    description: "Plano cercano deslizante sobre salpicadero, asientos y volante.",
    kind: "video",
    needsPhoto: true,
    warning: "Evita que la matrícula o el logo queden en primer plano -- en un recorte muy cercano pueden perder nitidez.",
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo de detalle: la cámara se desliza despacio por el interior del ${v} (salpicadero, asientos, volante), transmitiendo cuidado y calidad sin mostrar matrícula ni exterior.`,
  },
  {
    id: "oferta-flash",
    label: "Oferta flash",
    description: "Zoom dinámico sobre el coche, con espacio limpio arriba y abajo para añadir el precio después, a mano.",
    kind: "video",
    needsPhoto: true,
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo corto y dinámico con zoom de entrada hacia el ${v}, deja espacio limpio arriba y abajo de la imagen sin texto -- el precio se añadirá después, a mano, en edición.`,
  },
  {
    id: "lifestyle",
    label: "Lifestyle en movimiento",
    description: "El coche circulando por una calle o autovía, para dar sensación de uso real.",
    kind: "video",
    needsPhoto: true,
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo de estilo de vida: el ${v} circulando con suavidad por una calle urbana o una autovía despejada, luz de día, sensación de libertad y uso real.`,
  },
  {
    id: "coche-semana",
    label: "Coche de la semana",
    description: "Plantilla fija semanal con fondo de marca Lucero, para dar ritmo a redes sociales.",
    kind: "image",
    needsPhoto: false,
    buildPrompt: (v) => `${BASE_STYLE}. Imagen publicitaria de "coche de la semana" para Automóviles Lucero: un ${v} en un fondo de concesionario limpio y profesional, espacio libre arriba para añadir el texto "Coche de la semana" después, en edición.`,
  },
  {
    id: "temporada",
    label: "Temporada / evento",
    description: "El mismo coche con ambiente estacional (Navidad, verano, vuelta al cole...).",
    kind: "image",
    needsPhoto: false,
    warning: "Esta plantilla genera la imagen entera a partir de texto -- el coche resultante es una recreación, no la foto real del vehículo. Úsala solo para ambiente, nunca para mostrarlo como \"el coche exacto en venta\".",
    buildPrompt: (v, extra) => `${BASE_STYLE}. Imagen publicitaria de temporada para Automóviles Lucero: un ${v} en un ambiente de ${extra || "la temporada actual"}, estilo concesionario, sin texto añadido.`,
  },
  {
    id: "educativo",
    label: "Vídeo corto educativo",
    description: "Plano fijo del coche con idea de texto superpuesto tipo \"3 cosas a mirar antes de comprar\" (el texto se añade después, en edición).",
    kind: "video",
    needsPhoto: true,
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo de plano fijo, estable, del ${v} completo, bien iluminado, sin movimiento brusco de cámara -- pensado para añadir texto educativo encima después, en edición.`,
  },
  {
    id: "comparativa",
    label: "Comparativa de dos modelos",
    description: "Imagen con dos fotos lado a lado para \"¿cuál te pega más?\" -- sube primero la foto del coche A, genera, y repite con el coche B; el montaje final de las dos se hace en edición.",
    kind: "image",
    needsPhoto: false,
    buildPrompt: (v) => `${BASE_STYLE}. Imagen publicitaria de un ${v} solo, en fondo neutro de concesionario, pensada para montarse después junto a la foto de otro coche en una comparativa "¿cuál te pega más?".`,
  },
  {
    id: "antes-despues",
    label: "Antes / después del reacondicionado",
    description: "Para cuando el equipo limpia y prepara el coche antes de publicarlo -- genera solo la versión \"después\"; el \"antes\" es la foto real tal cual llegó.",
    kind: "image",
    needsPhoto: false,
    buildPrompt: (v) => `${BASE_STYLE}. Imagen del "después": un ${v} recién preparado y reluciente, listo para la venta, en el patio del concesionario, luz de día.`,
  },
];

export function findTemplate(id: string): StudioTemplate | undefined {
  return STUDIO_TEMPLATES.find((t) => t.id === id);
}
