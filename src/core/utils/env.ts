export const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export const getNodeEnv = () => process.env.NODE_ENV ?? "development";

export const isDevelopment = () => getNodeEnv() === "development";

export const isDebug = () => process.env.DEBUG_MODE === "true" || isDevelopment();

export const getLogLevel = () => (process.env.LOG_LEVEL as LogLevel) ?? "info";
