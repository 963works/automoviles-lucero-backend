import { readCollection, writeCollection } from "../store.js";

// Interruptor real de Miguel por teléfono (Fase 2 del encargo de conexión
// telefónica, 13/10/2026). Solo controla si las llamadas al número de
// Twilio entran al agente de voz o se desvían directamente a Ramón/José --
// nunca toca Yoigo, eso es un desvío aparte que gestiona el propio negocio.
type ToggleRecord = { id: "voice_agent"; enabled: boolean; updated_at: string; updated_by: string | null };

export function isVoiceAgentEnabled(): boolean {
  const row = readCollection<ToggleRecord>("agent_toggles").find((r) => r.id === "voice_agent");
  return row?.enabled ?? true;
}

export function setVoiceAgentEnabled(enabled: boolean, updatedBy: string | null = null): void {
  const rows = readCollection<ToggleRecord>("agent_toggles").filter((r) => r.id !== "voice_agent");
  rows.push({ id: "voice_agent", enabled, updated_at: new Date().toISOString(), updated_by: updatedBy });
  writeCollection("agent_toggles", rows);
}
