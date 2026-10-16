// Cliente real de Higgsfield (Lucero Studio AI, 16/10/2026). Mismo patrón
// honesto que integrations/whatsapp.ts: si no hay credenciales no se intenta
// nada, y si la API devuelve error se propaga tal cual, nunca se asume éxito.
//
// Endpoints confirmados de verdad contra la documentación oficial
// (docs.higgsfield.ai, quickstart + concepts/requests + api-reference/
// requests/get-request-status + el propio openapi.json) -- no son una
// suposición ni vienen de un SDK de terceros:
//   - Base: https://api.higgsfield.ai
//   - Auth: header Authorization: "Key <API_KEY_ID>:<API_KEY_SECRET>"
//   - Envío: POST a la ruta del modelo (p. ej. /higgsfield-ai/soul/v2/standard)
//     -> devuelve {status:"queued", request_id, status_url, cancel_url}
//   - Estado: GET /requests/{request_id}/status -> mismo objeto, con
//     status final completed/failed/nsfw/canceled, y el resultado en
//     "images"/"video"/"audio" según el tipo de modelo.
//   - Los enlaces de salida caducan (mínimo ~7 días) -- hay que descargarlos.

import crypto from "crypto";

const BASE_URL = "https://api.higgsfield.ai";

export function isHiggsfieldConnected(): boolean {
  return Boolean(process.env.HIGGSFIELD_API_KEY_ID && process.env.HIGGSFIELD_API_KEY_SECRET);
}

function authHeader(): string {
  return `Key ${process.env.HIGGSFIELD_API_KEY_ID}:${process.env.HIGGSFIELD_API_KEY_SECRET}`;
}

export type HiggsfieldStatus = "queued" | "in_progress" | "nsfw" | "failed" | "completed" | "canceled";

export type HiggsfieldRequestState = {
  status: HiggsfieldStatus;
  request_id: string;
  status_url?: string;
  cancel_url?: string;
  error?: string | null;
  images?: { url: string }[];
  video?: { url: string };
  audio?: { url: string };
  audios?: { url: string }[];
};

export type HiggsfieldResult = { ok: true; state: HiggsfieldRequestState } | { ok: false; error: string };

// modelPath: la ruta del modelo tal cual la documenta Higgsfield, sin la
// barra inicial (p. ej. "higgsfield-ai/soul/v2/standard" o
// "kling-video/v2.5-turbo/standard/image-to-video").
export async function submitHiggsfieldJob(modelPath: string, body: Record<string, unknown>): Promise<HiggsfieldResult> {
  if (!isHiggsfieldConnected()) return { ok: false, error: "higgsfield_not_connected" };
  try {
    const res = await fetch(`${BASE_URL}/${modelPath}`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        // Evita procesar dos veces el mismo encargo si la respuesta se
        // pierde por el camino (recomendación explícita de la propia
        // documentación de Higgsfield para reintentos seguros).
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    });
    // El error real de Higgsfield viene en "detail" (confirmado con una
    // llamada real: {"detail":"not_enough_credits"} al probar la cuenta
    // recién creada) -- no en "error" ni "message" como otras APIs.
    const data = (await res.json()) as HiggsfieldRequestState & { message?: string; detail?: string };
    if (!res.ok || !data.request_id) {
      return { ok: false, error: data.detail ?? data.error ?? data.message ?? `higgsfield_api_${res.status}` };
    }
    return { ok: true, state: data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "higgsfield_network_error" };
  }
}

export async function getHiggsfieldStatus(requestId: string): Promise<HiggsfieldResult> {
  if (!isHiggsfieldConnected()) return { ok: false, error: "higgsfield_not_connected" };
  try {
    const res = await fetch(`${BASE_URL}/requests/${requestId}/status`, {
      headers: { Authorization: authHeader() },
    });
    const data = (await res.json()) as HiggsfieldRequestState & { message?: string; detail?: string };
    if (!res.ok) return { ok: false, error: data.detail ?? data.error ?? data.message ?? `higgsfield_api_${res.status}` };
    return { ok: true, state: data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "higgsfield_network_error" };
  }
}

// Todas las URL de salida de un estado "completed", sea imagen, vídeo o audio.
export function outputUrls(state: HiggsfieldRequestState): string[] {
  const urls: string[] = [];
  if (state.images) urls.push(...state.images.map((i) => i.url));
  if (state.video) urls.push(state.video.url);
  if (state.audio) urls.push(state.audio.url);
  if (state.audios) urls.push(...state.audios.map((a) => a.url));
  return urls;
}
