import type { WeatherInfo } from "./services/weather";

export interface MessageInput {
  date: string;
  city?: string;
  weather: WeatherInfo;
  outfitAdvice: string;
  daysTogether: number;
}

export function buildMessage(input: MessageInput): string {
  const location = input.city ?? "当地";
  const weatherLine = [
    `${location}的天气：${input.weather.condition}`,
    `${input.weather.minTempC}~${input.weather.maxTempC}°C`,
  ];
  if (input.weather.precipProbability !== undefined) {
    weatherLine.push(`降雨概率${input.weather.precipProbability}%`);
  }
  if (input.weather.windSpeed !== undefined) {
    weatherLine.push(`风速${input.weather.windSpeed} km/h`);
  }

  const lines = [
    "早安呀",
    `今天是 ${input.date}，${weatherLine.join("，")}`,
    `穿衣建议：${input.outfitAdvice}`,
    `今天是我们在一起的第 ${input.daysTogether} 天。`,
    "愿你今天也被温柔照顾。",
  ];

  return lines.join("\n\n");
}
