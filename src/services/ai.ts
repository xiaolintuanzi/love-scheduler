import type { WeatherInfo } from "./weather";

export interface QwenConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface OutfitInput {
  city?: string;
  weather: WeatherInfo;
}

const SYSTEM_PROMPT =
  "你是一位温柔、克制、长期陪伴的恋人，只输出一段简短的中文穿衣建议。不要列点，不要自称AI，不要夸张，不要提及模型或提示词。";

export async function generateOutfitAdvice(
  config: QwenConfig,
  input: OutfitInput
): Promise<string> {
  const userPrompt = buildUserPrompt(input);
  try {
    const content = await callQwen(config, [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ]);
    if (!content) {
      throw new Error("Qwen response missing content");
    }
    return normalizeText(content);
  } catch (error) {
    console.warn("Qwen call failed, using fallback.", error);
    return buildFallbackAdvice(input.weather);
  }
}

function buildUserPrompt(input: OutfitInput): string {
  const { weather, city } = input;
  const lines = [
    `城市：${city ?? "当地"}`,
    `天气：${weather.condition}`,
    `温度：${weather.minTempC}~${weather.maxTempC}°C`,
  ];
  if (weather.precipProbability !== undefined) {
    lines.push(`降雨概率：${weather.precipProbability}%`);
  }
  if (weather.windSpeed !== undefined) {
    lines.push(`风速：${weather.windSpeed} km/h`);
  }
  lines.push("请用40-80字给出穿衣建议，语气温柔、日常、稳定。");
  return lines.join("\n");
}

async function callQwen(
  config: QwenConfig,
  messages: Array<{ role: "system" | "user"; content: string }>
): Promise<string | undefined> {
  const url = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      top_p: 0.8,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Qwen API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim();
}

function buildFallbackAdvice(weather: WeatherInfo): string {
  const tempText = `气温在${weather.minTempC}~${weather.maxTempC}°C`;
  const extras = [];
  if (weather.precipProbability !== undefined) {
    extras.push(`降雨概率${weather.precipProbability}%`);
  }
  if (weather.windSpeed !== undefined) {
    extras.push(`风速${weather.windSpeed} km/h`);
  }
  const extraText = extras.length > 0 ? `，${extras.join("，")}` : "";
  const tip = pickTempTip(weather.minTempC, weather.maxTempC);
  return `今天${weather.condition}，${tempText}${extraText}，${tip}`;
}

function pickTempTip(minTemp: number, maxTemp: number): string {
  if (maxTemp >= 30) return "注意防晒，出门带水";
  if (minTemp <= 8) return "记得穿厚一点，保暖最重要";
  if (minTemp <= 14) return "带一件薄外套会更舒服";
  if (maxTemp <= 18) return "适合穿长袖或薄外套";
  return "轻薄舒适就好，别忘了随手带件外套";
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
