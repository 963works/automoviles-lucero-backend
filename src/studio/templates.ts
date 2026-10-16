// Las 10 plantillas de Lucero Studio AI (16/10/2026, a petición real: "vamos
// a construir el agente de imágenes de higgsfield... lo demás hazlo tú").
// Ramón y José nunca escriben un prompt a mano: eligen una plantilla, suben
// la foto real del coche (o no, si la plantilla no la necesita) y el motor
// rellena el prompt final con marca/modelo/versión.
//
// Solo se usan los 2 modelos cuya ruta de API está confirmada de verdad
// contra la documentación oficial de Higgsfield (quickstart + el propio
// openapi.json) -- no se inventan rutas para Kling 3.0/Wan/Marketing Studio
// Image que solo aparecían nombrados en la página de precios, sin su ruta
// exacta, para no arriesgar dinero real contra un endpoint adivinado:
//   - "higgsfield-ai/soul/v2/standard" (imagen, solo texto -- confirmado en
//     el ejemplo curl del quickstart)
//   - "kling-video/v2.5-turbo/standard/image-to-video" (vídeo a partir de
//     UNA foto + texto -- confirmado en el openapi.json)
//   - "kling-video/v2.5-turbo/standard/text-to-video" (vídeo solo texto,
//     mismo origen)
// Cuando Higgsfield confirme en su documentación una ruta real para Kling
// 3.0/Wan/Marketing Studio Image, se puede añadir sin tocar esta estructura.

export type StudioModelKind = "image_text" | "video_image_to_video" | "video_text";

export type StudioTemplate = {
  id: string;
  label: string;
  description: string;
  kind: StudioModelKind;
  modelPath: string;
  needsPhoto: boolean;
  // Nota real de riesgo heredada de la investigación (Wan 2.6 reduce la
  // imagen de entrada a máx. 1440px, lo que puede volver ilegible una
  // matrícula o un logo) -- se avisa en el CRM cuando aplica, aunque esta
  // plantilla use Kling, no Wan, por si en el futuro cambia de modelo.
  warning?: string;
  buildPrompt: (vehicleLabel: string, extra?: string) => string;
};

const BASE_STYLE =
  "fotografía publicitaria de concesionario de coches, iluminación limpia y realista, nada de texto ni logotipos añadidos por la IA, nunca inventar matrícula ni marca distinta a la real";

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  {
    id: "llegada",
    label: "Ha llegado",
    description: "Primer post cuando entra un coche al stock -- la cámara gira despacio alrededor del vehículo.",
    kind: "video_image_to_video",
    modelPath: "kling-video/v2.5-turbo/standard/image-to-video",
    needsPhoto: true,
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo publicitario de "ha llegado": la cámara gira lento 360° alrededor del ${v}, mostrando el coche entero con orgullo, como el primer vistazo a un coche recién llegado al concesionario.`,
  },
  {
    id: "paseo-exterior",
    label: "Paseo exterior",
    description: "Barrido lateral cinematográfico del coche en el patio o la calle.",
    kind: "video_image_to_video",
    modelPath: "kling-video/v2.5-turbo/standard/image-to-video",
    needsPhoto: true,
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo cinematográfico: la cámara se desplaza lateralmente, despacio, a lo largo del ${v} parado, destacando la carrocería y la silueta del vehículo.`,
  },
  {
    id: "detalle-interior",
    label: "Detalle interior",
    description: "Plano cercano deslizante sobre salpicadero, asientos y volante.",
    kind: "video_image_to_video",
    modelPath: "kling-video/v2.5-turbo/standard/image-to-video",
    needsPhoto: true,
    warning: "Evita que la matrícula o el logo queden en primer plano -- en un recorte muy cercano pueden perder nitidez.",
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo de detalle: la cámara se desliza despacio por el interior del ${v} (salpicadero, asientos, volante), transmitiendo cuidado y calidad sin mostrar matrícula ni exterior.`,
  },
  {
    id: "oferta-flash",
    label: "Oferta flash",
    description: "Zoom dinámico sobre el coche, con espacio limpio arriba y abajo para añadir el precio después, a mano.",
    kind: "video_image_to_video",
    modelPath: "kling-video/v2.5-turbo/standard/image-to-video",
    needsPhoto: true,
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo corto y dinámico con zoom de entrada hacia el ${v}, deja espacio limpio arriba y abajo de la imagen sin texto -- el precio se añadirá después, a mano, en edición.`,
  },
  {
    id: "lifestyle",
    label: "Lifestyle en movimiento",
    description: "El coche circulando por una calle o autovía, para dar sensación de uso real.",
    kind: "video_image_to_video",
    modelPath: "kling-video/v2.5-turbo/standard/image-to-video",
    needsPhoto: true,
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo de estilo de vida: el ${v} circulando con suavidad por una calle urbana o una autovía despejada, luz de día, sensación de libertad y uso real.`,
  },
  {
    id: "coche-semana",
    label: "Coche de la semana",
    description: "Plantilla fija semanal con fondo de marca Lucero, para dar ritmo a redes sociales.",
    kind: "image_text",
    modelPath: "higgsfield-ai/soul/v2/standard",
    needsPhoto: false,
    buildPrompt: (v) => `${BASE_STYLE}. Imagen publicitaria de "coche de la semana" para Automóviles Lucero: un ${v} en un fondo de concesionario limpio y profesional, espacio libre arriba para añadir el texto "Coche de la semana" después, en edición.`,
  },
  {
    id: "temporada",
    label: "Temporada / evento",
    description: "El mismo coche con ambiente estacional (Navidad, verano, vuelta al cole...).",
    kind: "image_text",
    modelPath: "higgsfield-ai/soul/v2/standard",
    needsPhoto: false,
    warning: "Esta plantilla genera la imagen entera a partir de texto -- el coche resultante es una recreación, no la foto real del vehículo. Úsala solo para ambiente, nunca para mostrarlo como \"el coche exacto en venta\".",
    buildPrompt: (v, extra) => `${BASE_STYLE}. Imagen publicitaria de temporada para Automóviles Lucero: un ${v} en un ambiente de ${extra || "la temporada actual"}, estilo concesionario, sin texto añadido.`,
  },
  {
    id: "educativo",
    label: "Vídeo corto educativo",
    description: "Plano fijo del coche con idea de texto superpuesto tipo \"3 cosas a mirar antes de comprar\" (el texto se añade después, en edición).",
    kind: "video_image_to_video",
    modelPath: "kling-video/v2.5-turbo/standard/image-to-video",
    needsPhoto: true,
    buildPrompt: (v) => `${BASE_STYLE}. Vídeo de plano fijo, estable, del ${v} completo, bien iluminado, sin movimiento brusco de cámara -- pensado para añadir texto educativo encima después, en edición.`,
  },
  {
    id: "comparativa",
    label: "Comparativa de dos modelos",
    description: "Imagen con dos fotos lado a lado para \"¿cuál te pega más?\" -- sube primero la foto del coche A, genera, y repite con el coche B; el montaje final de las dos se hace en edición.",
    kind: "image_text",
    modelPath: "higgsfield-ai/soul/v2/standard",
    needsPhoto: false,
    buildPrompt: (v) => `${BASE_STYLE}. Imagen publicitaria de un ${v} solo, en fondo neutro de concesionario, pensada para montarse después junto a la foto de otro coche en una comparativa "¿cuál te pega más?".`,
  },
  {
    id: "antes-despues",
    label: "Antes / después del reacondicionado",
    description: "Para cuando el equipo limpia y prepara el coche antes de publicarlo -- genera solo la versión \"después\"; el \"antes\" es la foto real tal cual llegó.",
    kind: "image_text",
    modelPath: "higgsfield-ai/soul/v2/standard",
    needsPhoto: false,
    buildPrompt: (v) => `${BASE_STYLE}. Imagen del "después": un ${v} recién preparado y reluciente, listo para la venta, en el patio del concesionario, luz de día.`,
  },
];

export function findTemplate(id: string): StudioTemplate | undefined {
  return STUDIO_TEMPLATES.find((t) => t.id === id);
}
