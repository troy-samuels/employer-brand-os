/**
 * @module lib/utils/logger
 * Structured logger for OpenRole.
 *
 * ADOPTION STRATEGY: This logger should be adopted gradually across the codebase.
 * There are ~73 console.error/console.log calls that should migrate to this logger
 * over time. Don't bulk-replace — adopt per-file as you touch code.
 *
 * Usage:
 *   import logger from "@/lib/utils/logger";
 *   logger.info("Audit started", { companySlug: "acme" });
 *   logger.error("Audit failed", { error: err.message, companySlug: "acme" });
 *
 * In production: outputs JSON lines (machine-parseable for log aggregators).
 * In development: outputs human-readable colored format.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m",  // green
  warn: "\x1b[33m",  // yellow
  error: "\x1b[31m", // red
};

const RESET = "\x1b[0m";

const isProduction = process.env.NODE_ENV === "production";
const minLevel: LogLevel = isProduction ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
}

function formatDev(entry: LogEntry): string {
  const color = LOG_LEVEL_COLORS[entry.level];
  const levelTag = `${color}[${entry.level.toUpperCase()}]${RESET}`;
  const time = entry.timestamp.split("T")[1]?.replace("Z", "") ?? entry.timestamp;

  // Extract metadata (everything except timestamp, level, message)
  const meta: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entry)) {
    if (key !== "timestamp" && key !== "level" && key !== "message") {
      meta[key] = value;
    }
  }
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";

  return `${time} ${levelTag} ${entry.message}${metaStr}`;
}

function formatProd(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  };

  const formatted = isProduction ? formatProd(entry) : formatDev(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) => log("debug", message, metadata),
  info: (message: string, metadata?: Record<string, unknown>) => log("info", message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) => log("warn", message, metadata),
  error: (message: string, metadata?: Record<string, unknown>) => log("error", message, metadata),
};

export default logger;
