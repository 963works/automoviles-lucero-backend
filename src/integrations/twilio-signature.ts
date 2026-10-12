import twilio from "twilio";

// Verificación real de la firma de Twilio (X-Twilio-Signature). Twilio pide
// explícitamente no reimplementar el algoritmo a mano -- se usa su propio
// validateRequest, igual de real que verifyRetellSignature para el otro
// webhook, solo que con la librería oficial en vez de HMAC manual.
export const VOICE_INBOUND_URL =
  process.env.TWILIO_VOICE_WEBHOOK_URL ??
  "https://virelia-hub-lucero.lzc0bh.easypanel.host/telephony/voice-inbound";

export function verifyTwilioSignature(
  signature: string | undefined,
  params: Record<string, unknown>,
  authToken: string | undefined,
): boolean {
  if (!authToken || !signature) return false;
  return twilio.validateRequest(authToken, signature, VOICE_INBOUND_URL, params as Record<string, string>);
}
