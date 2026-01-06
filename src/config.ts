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

const DEFAULT_TIMEZONE = "Asia/Shanghai";
const DEFAULT_QWEN_MODEL = "qwen-plus";
const DEFAULT_QWEN_BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1";
const DEFAULT_SUBJECT = "早安";

export function getConfig(env: Bindings): Config {
  const timezone = env.TIMEZONE?.trim() || DEFAULT_TIMEZONE;
  const startDate = requireEnv(env, "START_DATE").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error("START_DATE must be YYYY-MM-DD");
  }

  const lat = parseNumber(requireEnv(env, "WEATHER_LAT"), "WEATHER_LAT");
  const lon = parseNumber(requireEnv(env, "WEATHER_LON"), "WEATHER_LON");
  const city = env.WEATHER_CITY?.trim() || undefined;

  const qwenApiKey = requireEnv(env, "QWEN_API_KEY");
  const qwenModel = env.QWEN_MODEL?.trim() || DEFAULT_QWEN_MODEL;
  const qwenBaseUrl = env.QWEN_BASE_URL?.trim() || DEFAULT_QWEN_BASE_URL;

  const resendApiKey = requireEnv(env, "RESEND_API_KEY");
  const emailFrom = requireEnv(env, "EMAIL_FROM").trim();
  const emailTo = splitList(requireEnv(env, "EMAIL_TO"));
  if (emailTo.length === 0) {
    throw new Error("EMAIL_TO must include at least one recipient");
  }
  const subject = env.EMAIL_SUBJECT?.trim() || DEFAULT_SUBJECT;

  return {
    timezone,
    startDate,
    weather: {
      lat,
      lon,
      city,
    },
    qwen: {
      apiKey: qwenApiKey,
      model: qwenModel,
      baseUrl: qwenBaseUrl,
    },
    email: {
      apiKey: resendApiKey,
      from: emailFrom,
      to: emailTo,
      subject,
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

function parseNumber(value: string, key: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} must be a valid number`);
  }
  return parsed;
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
