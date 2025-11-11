import {getLogLevel, LOG_LEVELS, type LogLevel} from "./env";

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = getLogLevel();
const resolvedLevel: LogLevel = LOG_LEVELS.includes(currentLevel) ? currentLevel : "info";

export const log = (level: LogLevel, ...args: unknown[]) => {
  if (levelPriority[level] < levelPriority[resolvedLevel]) {
    return;
  }

  const method = level === "debug" ? "log" : level;
  console[method](`[${level.toUpperCase()}]`, ...args);
};

export const debug = (...args: unknown[]) => log("debug", ...args);
export const info = (...args: unknown[]) => log("info", ...args);
export const warn = (...args: unknown[]) => log("warn", ...args);
export const error = (...args: unknown[]) => log("error", ...args);

export const logPlan = (planSummary: {template: string; segments: number; fps?: number}) => {
  info("Plan summary", planSummary);
};
