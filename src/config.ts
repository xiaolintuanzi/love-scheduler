import { appConfig, type AppConfig } from "./app-config";
import type { Bindings } from "./types";

export interface Config {
  timezone: string;
  startDate: string;
  weather: {
    lat: number;
    lon: number;
    city?: string;
  };
  qwen: {
    apiKey: string;
    model: string;
    baseUrl: string;
  };
  email: {
    apiKey: string;
    from: string;
    to: string[];
    subject: string;
  };
}

export function getConfig(env: Bindings): Config {
  const qwenApiKey = requireEnv(env, "QWEN_API_KEY");
  const resendApiKey = requireEnv(env, "RESEND_API_KEY");
  const local = normalizeAppConfig(appConfig);

  return {
    timezone: local.timezone,
    startDate: local.startDate,
    weather: {
      lat: local.weather.lat,
      lon: local.weather.lon,
      city: local.weather.city,
    },
    qwen: {
      apiKey: qwenApiKey,
      model: local.qwen.model,
      baseUrl: local.qwen.baseUrl,
    },
    email: {
      apiKey: resendApiKey,
      from: local.email.from,
      to: local.email.to,
      subject: local.email.subject,
    },
  };
}

function requireEnv(env: Bindings, key: keyof Bindings): string {
  const value = env[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${key} is required`);
  }
  return value;
}

function normalizeAppConfig(config: AppConfig): AppConfig {
  const timezone = requireString(config.timezone, "timezone");
  const startDate = requireString(config.startDate, "startDate");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error("appConfig.startDate must be YYYY-MM-DD");
  }

  const lat = requireNumber(config.weather.lat, "weather.lat");
  const lon = requireNumber(config.weather.lon, "weather.lon");
  const city = config.weather.city?.trim() || undefined;

  const model = requireString(config.qwen.model, "qwen.model");
  const baseUrl = requireString(config.qwen.baseUrl, "qwen.baseUrl");

  const from = requireString(config.email.from, "email.from");
  const to = config.email.to
    .map((address) => address.trim())
    .filter((address) => address.length > 0);
  if (to.length === 0) {
    throw new Error("appConfig.email.to must include at least one recipient");
  }
  const subject = requireString(config.email.subject, "email.subject");

  return {
    timezone,
    startDate,
    weather: {
      lat,
      lon,
      city,
    },
    qwen: {
      model,
      baseUrl,
    },
    email: {
      from,
      to,
      subject,
    },
  };
}

function requireString(value: string, key: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`appConfig.${key} is required`);
  }
  return value.trim();
}

function requireNumber(value: number, key: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`appConfig.${key} must be a valid number`);
  }
  return value;
}
