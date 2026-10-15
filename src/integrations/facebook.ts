import crypto from "crypto";

// Envío real por la API de Messenger (Meta), mismo patrón honesto que
// integrations/whatsapp.ts: si no hay credenciales no se intenta nada, y si
// la API devuelve error se propaga tal cual, nunca se asume entregado.
//
// Credenciales necesarias (16/10/2026, "vamos con el agente de chat de
// Facebook"): FACEBOOK_PAGE_ACCESS_TOKEN (token de la página, con permiso
// pages_messaging), FACEBOOK_APP_SECRET (para verificar la firma del
// webhook), FACEBOOK_WEBHOOK_VERIFY_TOKEN (el que se pone al configurar el
// webhook en el panel de Meta -- lo elige el propio negocio).

const GRAPH_VERSION = "v21.0";

export function isFacebookConnected(): boolean {
  return Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
}

export type FacebookSendResult = { ok: true; messageId: string } | { ok: false; error: string };

export async function sendFacebookText(psid: string, body: string): Promise<FacebookSendResult> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) return { ok: false, error: "facebook_not_connected" };

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/me/messages?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: psid },
        message: { text: body },
        messaging_type: "RESPONSE",
      }),
    });
    const data = (await res.json()) as { message_id?: string; error?: { message?: string; code?: number } };
    if (!res.ok || !data.message_id) {
      return { ok: false, error: data.error?.message ?? `facebook_api_${res.status}` };
    }
    return { ok: true, messageId: data.message_id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "facebook_network_error" };
  }
}

// Firma del webhook (X-Hub-Signature-256, HMAC-SHA256 del cuerpo crudo con
// el App Secret) -- mismo criterio que verifyTwilioSignature/verifyRetellSignature:
// se calcula sobre los bytes exactos que mandó Meta, nunca sobre el body ya
// parseado a objeto.
export function verifyFacebookSignature(signatureHeader: string | undefined, rawBody: string, appSecret: string | undefined): boolean {
  if (!signatureHeader || !appSecret) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
