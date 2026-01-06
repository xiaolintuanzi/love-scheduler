import { getConfig } from "../config";
import { buildMessage } from "../message";
import { generateOutfitAdvice } from "../services/ai";
import { sendEmail } from "../services/mailer";
import { getDailyWeather } from "../services/weather";
import type { Bindings } from "../types";
import { daysTogetherInclusive, formatDateInTimeZone } from "../utils/date";

export async function runJob(
  env: Bindings,
  scheduledTime?: number
): Promise<void> {
  const config = getConfig(env);
  const now = scheduledTime ? new Date(scheduledTime) : new Date();
  const date = formatDateInTimeZone(now, config.timezone);

  console.log(`[job] start ${date} ${config.timezone}`);

  const weather = await getDailyWeather(
    config.weather.query,
    config.weather.apiKey
  );
  const daysTogether = daysTogetherInclusive(config.startDate, date);
  const outfitAdvice = await generateOutfitAdvice(config.qwen, {
    city: config.weather.city,
    weather,
  });
  const message = buildMessage({
    date,
    city: config.weather.city,
    weather,
    outfitAdvice,
    daysTogether,
  });

  await sendEmail(config.email, message);
  console.log("[job] email sent");
}
