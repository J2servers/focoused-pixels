// Structured logger for edge functions.
// Levels: debug | info | warn | error. Writes JSON lines to stdout/stderr.
// Set LOG_LEVEL env to 'debug' | 'info' | 'warn' | 'error' (default: info).

type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function currentThreshold(): number {
  const env = (globalThis as unknown as { Deno?: { env: { get(k: string): string | undefined } } }).Deno?.env.get("LOG_LEVEL");
  const lvl = (env || "info").toLowerCase() as Level;
  return LEVELS[lvl] ?? LEVELS.info;
}

function emit(level: Level, scope: string, message: string, data?: unknown) {
  if (LEVELS[level] < currentThreshold()) return;
  const entry = {
    ts: new Date().toISOString(),
    level,
    scope,
    msg: message,
    ...(data !== undefined ? { data: safe(data) } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error" || level === "warn") {
    console.error(line);
  } else {
    console.log(line);
  }
}

function safe(value: unknown): unknown {
  try {
    if (value instanceof Error) {
      return { name: value.name, message: value.message, stack: value.stack };
    }
    JSON.stringify(value);
    return value;
  } catch {
    return String(value);
  }
}

export function createLogger(scope: string) {
  return {
    debug: (msg: string, data?: unknown) => emit("debug", scope, msg, data),
    info: (msg: string, data?: unknown) => emit("info", scope, msg, data),
    warn: (msg: string, data?: unknown) => emit("warn", scope, msg, data),
    error: (msg: string, data?: unknown) => emit("error", scope, msg, data),
  };
}

export const logger = createLogger("edge");
