export type JsonRecord = Record<string, unknown>;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const record = toRecord(body);
    throw new ApiError(
      stringValue(record.detail) ??
        stringValue(record.message) ??
        `Request failed (${response.status})`,
      response.status,
    );
  }

  return body as T;
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return api<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function toRecord(value: unknown): JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

export function toRecords(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map(toRecord) : [];
}

export function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function label(value: unknown, fallback = "—"): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return fallback;
}

export function money(value: unknown): string {
  const number = numberValue(value);
  if (number === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
}

export function percent(value: unknown): string {
  const number = numberValue(value);
  return number === null ? "—" : `${(number * 100).toFixed(1)}%`;
}

export function dateTime(value: unknown): string {
  const number = numberValue(value);
  if (number === null) return label(value);
  const timestamp = number > 10_000_000_000 ? number : number * 1000;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(timestamp);
}
