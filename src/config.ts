import { appConfig, type AppConfig } from "./app-config";
import type { Bindings } from "./types";

interface NormalizedAppConfig extends Omit<AppConfig, "weather" | "email"> {
  weather: {
    city: string;
    cityCode?: string;
    query: string;
  };
  email: {
    from: string;
    to: string[];
    subject: string;
  };
}

export interface Config {
  timezone: string;
  startDate: string;
  weather: {
    city: string;
    query: string;
    apiKey: string;
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
  const amapApiKey = requireEnv(env, "AMAP_API_KEY");
  const qwenApiKey = requireEnv(env, "QWEN_API_KEY");
  const resendApiKey = requireEnv(env, "RESEND_API_KEY");
  const local = normalizeAppConfig(appConfig);

  return {
    timezone: local.timezone,
    startDate: local.startDate,
    weather: {
      city: local.weather.city,
      query: local.weather.query,
      apiKey: amapApiKey,
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

function normalizeAppConfig(config: AppConfig): NormalizedAppConfig {
  const timezone = requireString(config.timezone, "timezone");
  const startDate = requireString(config.startDate, "startDate");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error("appConfig.startDate must be YYYY-MM-DD");
  }

  const city = requireString(config.weather.city, "weather.city");
  const cityCode = config.weather.cityCode?.trim() || undefined;
  const query = cityCode || city;

  const model = requireString(config.qwen.model, "qwen.model");
  const baseUrl = requireString(config.qwen.baseUrl, "qwen.baseUrl");

  const from = requireString(config.email.from, "email.from");
  const to = normalizeRecipients(config.email.to, "email.to");
  if (to.length === 0) {
    throw new Error("appConfig.email.to must include at least one recipient");
  }
  const subject = requireString(config.email.subject, "email.subject");

  return {
    timezone,
    startDate,
    weather: {
      city,
      cityCode,
      query,
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

function normalizeRecipients(value: string | string[], key: string): string[] {
  if (Array.isArray(value)) {
    return value
      .map((address) => requireString(address, key))
      .filter((address) => address.length > 0);
  }
  if (typeof value !== "string") {
    throw new Error(`appConfig.${key} must be a string or string[]`);
  }
  return value
    .split(",")
    .map((address) => address.trim())
    .filter((address) => address.length > 0);
}
