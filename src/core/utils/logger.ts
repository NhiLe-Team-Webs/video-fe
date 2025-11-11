type LogLevel = "info" | "warn" | "error";

const log = (level: LogLevel, ...args: unknown[]) => {
  console[level](`[${level.toUpperCase()}]`, ...args);
};

export const logger = {
  info: (...args: unknown[]) => log("info", ...args),
  warn: (...args: unknown[]) => log("warn", ...args),
  error: (...args: unknown[]) => log("error", ...args),
};
