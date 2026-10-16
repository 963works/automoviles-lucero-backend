// Ciclo de vida de los trabajos de Lucero Studio AI (16/10/2026). Mismo
// patrón de almacenamiento que el resto del proyecto: una colección JSON
// sobre el volumen persistente real (store.ts), nada de base de datos nueva
// solo para esto.
//
// Control de coste ANTES de llamar a Higgsfield, no después (a petición
// explícita): tope mensual y tope de generaciones simultáneas. Los precios
// por segundo/imagen de Higgsfield están tomados de su página pública de
// precios (open.higgsfield.ai) para sus modelos insignia (Soul 2, Kling
// 3.0) -- la ruta de API real confirmada para vídeo es Kling v2.5-turbo
// (ver templates.ts), de la misma familia pero sin precio propio publicado
// todavía, así que esta estimación es deliberadamente conservadora (al
// alza) y solo sirve para frenar el gasto antes de tiempo, nunca como
// factura exacta -- la factura real se revisa en el panel de Higgsfield.
import crypto from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { readCollection, writeCollection } from "../store.js";
import { submitHiggsfieldJob, getHiggsfieldStatus, outputUrls, isHiggsfieldConnected, type HiggsfieldStatus } from "./higgsfield.js";
import { findTemplate, type StudioTemplate } from "./templates.js";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "studio_uploads");
const OUTPUTS_DIR = path.join(DATA_DIR, "studio_outputs");
for (const dir of [UPLOADS_DIR, OUTPUTS_DIR]) if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL ?? "https://virelia-hub-lucero.lzc0bh.easypanel.host";

const MONTHLY_BUDGET_EUR = Number(process.env.HIGGSFIELD_MONTHLY_BUDGET_EUR ?? 60);
const MAX_CONCURRENT = Number(process.env.HIGGSFIELD_MAX_CONCURRENT ?? 2);

// Estimación al alza, no la factura real (ver nota de arriba).
const ESTIMATED_COST_EUR: Record<StudioTemplate["kind"], number> = {
  image_text: 0.01,
  video_image_to_video: 0.25,
  video_text: 0.25,
};

export type StudioJobStatus =
  | "submitted" // enviado a Higgsfield, esperando
  | "in_progress"
  | "completed"
  | "failed"
  | "nsfw"
  | "canceled"
  | "rejected_budget"
  | "rejected_concurrency";

export type StudioJob = {
  id: string;
  template_id: string;
  vehicle_label: string;
  extra: string | null;
  photo_path: string | null; // ruta relativa dentro de DATA_DIR, o null si la plantilla no necesita foto
  status: StudioJobStatus;
  higgsfield_request_id: string | null;
  output_paths: string[]; // rutas relativas dentro de DATA_DIR, ya descargadas
  error: string | null;
  estimated_cost_eur: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

function now(): string {
  return new Date().toISOString();
}

function list(): StudioJob[] {
  return readCollection<StudioJob>("studio_jobs");
}
function save(rows: StudioJob[]) {
  writeCollection("studio_jobs", rows);
}

export function listStudioJobs(): StudioJob[] {
  return list().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getStudioJob(id: string): StudioJob | undefined {
  return list().find((j) => j.id === id);
}

function currentMonthKey(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" }).slice(0, 7); // "2026-10"
}

export function monthSpendEur(): number {
  const month = currentMonthKey();
  return list()
    .filter((j) => j.created_at.slice(0, 7) === month && !j.status.startsWith("rejected_"))
    .reduce((sum, j) => sum + j.estimated_cost_eur, 0);
}

export function activeJobCount(): number {
  return list().filter((j) => j.status === "submitted" || j.status === "in_progress").length;
}

export function budgetInfo() {
  return { monthlyBudgetEur: MONTHLY_BUDGET_EUR, spentEur: monthSpendEur(), maxConcurrent: MAX_CONCURRENT, activeNow: activeJobCount() };
}

// Guarda la foto subida en el volumen persistente y devuelve su ruta
// pública real (necesaria porque la API de Higgsfield recibe una URL que
// ELLA misma descarga, no el archivo -- nunca un binario subido directo).
export function saveUploadedPhoto(buffer: Buffer, originalName: string): { relPath: string; publicUrl: string } {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const fileName = `${crypto.randomUUID()}${ext}`;
  writeFileSync(path.join(UPLOADS_DIR, fileName), buffer);
  const relPath = `studio_uploads/${fileName}`;
  return { relPath, publicUrl: `${PUBLIC_BASE_URL}/crm/studio/archivo/${relPath}` };
}

export function absolutePathFor(relPath: string): string {
  return path.join(DATA_DIR, relPath);
}

export type CreateJobInput = {
  templateId: string;
  vehicleLabel: string;
  extra?: string;
  photo?: { relPath: string; publicUrl: string } | null;
  createdBy: string;
};

export type CreateJobResult = { ok: true; job: StudioJob } | { ok: false; error: string };

export async function createStudioJob(input: CreateJobInput): Promise<CreateJobResult> {
  const template = findTemplate(input.templateId);
  if (!template) return { ok: false, error: "plantilla_desconocida" };
  if (template.needsPhoto && !input.photo) return { ok: false, error: "esta_plantilla_necesita_foto" };
  if (!isHiggsfieldConnected()) return { ok: false, error: "higgsfield_no_conectado" };

  const cost = ESTIMATED_COST_EUR[template.kind];
  if (monthSpendEur() + cost > MONTHLY_BUDGET_EUR) {
    return makeRejected(input, template, cost, "rejected_budget", `Se pararía el gasto mensual estimado (tope ${MONTHLY_BUDGET_EUR} €). Pide que se amplíe el tope si quieres seguir generando este mes.`);
  }
  if (activeJobCount() >= MAX_CONCURRENT) {
    return makeRejected(input, template, cost, "rejected_concurrency", `Ya hay ${MAX_CONCURRENT} generaciones en marcha a la vez. Espera a que termine alguna antes de lanzar otra.`);
  }

  const prompt = template.buildPrompt(input.vehicleLabel, input.extra);
  const body: Record<string, unknown> =
    template.kind === "image_text" ? { prompt } : input.photo ? { prompt, image_url: input.photo.publicUrl } : { prompt };

  const submitted = await submitHiggsfieldJob(template.modelPath, body);
  const job: StudioJob = {
    id: crypto.randomUUID(),
    template_id: template.id,
    vehicle_label: input.vehicleLabel,
    extra: input.extra ?? null,
    photo_path: input.photo?.relPath ?? null,
    status: submitted.ok ? "submitted" : "failed",
    higgsfield_request_id: submitted.ok ? submitted.state.request_id : null,
    output_paths: [],
    error: submitted.ok ? null : submitted.error,
    estimated_cost_eur: cost,
    created_by: input.createdBy,
    created_at: now(),
    updated_at: now(),
  };
  save([...list(), job]);
  return { ok: true, job };
}

function makeRejected(input: CreateJobInput, template: StudioTemplate, cost: number, status: StudioJobStatus, error: string): CreateJobResult {
  const job: StudioJob = {
    id: crypto.randomUUID(),
    template_id: template.id,
    vehicle_label: input.vehicleLabel,
    extra: input.extra ?? null,
    photo_path: input.photo?.relPath ?? null,
    status,
    higgsfield_request_id: null,
    output_paths: [],
    error,
    estimated_cost_eur: cost,
    created_by: input.createdBy,
    created_at: now(),
    updated_at: now(),
  };
  save([...list(), job]);
  return { ok: true, job };
}

const TERMINAL: HiggsfieldStatus[] = ["completed", "failed", "nsfw", "canceled"];

// Comprueba el estado real en Higgsfield y, si ya terminó, descarga el
// resultado al volumen persistente -- nunca se depende de la URL temporal
// de Higgsfield (caduca en días), se copia en cuanto está lista.
export async function pollStudioJob(id: string): Promise<StudioJob | undefined> {
  const rows = list();
  const job = rows.find((j) => j.id === id);
  if (!job) return undefined;
  if (job.status !== "submitted" && job.status !== "in_progress") return job;
  if (!job.higgsfield_request_id) return job;

  const result = await getHiggsfieldStatus(job.higgsfield_request_id);
  if (!result.ok) {
    job.error = result.error;
    job.updated_at = now();
    save(rows);
    return job;
  }

  const status = result.state.status;
  if (!TERMINAL.includes(status)) {
    job.status = status === "queued" ? "submitted" : "in_progress";
    job.updated_at = now();
    save(rows);
    return job;
  }

  if (status === "completed") {
    const urls = outputUrls(result.state);
    const downloaded: string[] = [];
    for (let i = 0; i < urls.length; i++) {
      try {
        downloaded.push(await downloadOutput(job.id, i, urls[i]));
      } catch (err) {
        job.error = `descarga_fallida: ${err instanceof Error ? err.message : err}`;
      }
    }
    job.output_paths = downloaded;
    job.status = downloaded.length > 0 ? "completed" : "failed";
  } else if (status === "failed" || status === "nsfw" || status === "canceled") {
    job.status = status;
    job.error = result.state.error ?? job.error;
  }
  job.updated_at = now();
  save(rows);
  return job;
}

async function downloadOutput(jobId: string, index: number, url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`descarga_${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = guessExt(url, res.headers.get("content-type"));
  const dir = path.join(OUTPUTS_DIR, jobId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const fileName = `${index}${ext}`;
  writeFileSync(path.join(dir, fileName), buf);
  return `studio_outputs/${jobId}/${fileName}`;
}

function guessExt(url: string, contentType: string | null): string {
  if (contentType?.includes("video")) return ".mp4";
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return ".jpg";
  const fromUrl = path.extname(new URL(url).pathname);
  return fromUrl || ".jpg";
}
