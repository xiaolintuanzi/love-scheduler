export interface WeatherInfo {
  condition: string;
  minTempC: number;
  maxTempC: number;
  precipProbability?: number;
  windSpeed?: number;
}

export async function getDailyWeather(
  lat: number,
  lon: number,
  timeZone: string
): Promise<WeatherInfo> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "daily",
    "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max"
  );
  url.searchParams.set("timezone", timeZone);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Weather API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    daily?: {
      weathercode?: number[];
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      precipitation_probability_max?: number[];
      windspeed_10m_max?: number[];
    };
  };

  const daily = data.daily;
  if (!daily) {
    throw new Error("Weather API response missing daily data");
  }

  const index = 0;
  const weatherCode = daily.weathercode?.[index];
  const maxTemp = daily.temperature_2m_max?.[index];
  const minTemp = daily.temperature_2m_min?.[index];
  if (weatherCode === undefined || maxTemp === undefined || minTemp === undefined) {
    throw new Error("Weather API response missing temperature data");
  }

  const precip = daily.precipitation_probability_max?.[index];
  const wind = daily.windspeed_10m_max?.[index];

  return {
    condition: mapWeatherCode(weatherCode),
    minTempC: roundTemp(minTemp),
    maxTempC: roundTemp(maxTemp),
    precipProbability: precip !== undefined ? Math.round(precip) : undefined,
    windSpeed: wind !== undefined ? Math.round(wind) : undefined,
  };
}

function roundTemp(value: number): number {
  return Math.round(value);
}

function mapWeatherCode(code: number): string {
  if (code === 0) return "晴朗";
  if (code === 1) return "大部晴朗";
  if (code === 2) return "多云";
  if (code === 3) return "阴天";
  if (code === 45 || code === 48) return "有雾";
  if (code === 51 || code === 53 || code === 55) return "毛毛雨";
  if (code === 56 || code === 57) return "冻雨";
  if (code === 61) return "小雨";
  if (code === 63) return "中雨";
  if (code === 65) return "大雨";
  if (code === 66 || code === 67) return "冻雨";
  if (code === 71) return "小雪";
  if (code === 73) return "中雪";
  if (code === 75) return "大雪";
  if (code === 77) return "雪粒";
  if (code === 80 || code === 81) return "阵雨";
  if (code === 82) return "强阵雨";
  if (code === 85 || code === 86) return "阵雪";
  if (code === 95 || code === 96 || code === 99) return "雷阵雨";
  return "天气多变";
}
