export interface WeatherInfo {
  condition: string;
  minTempC: number;
  maxTempC: number;
  precipProbability?: number;
  windSpeed?: number;
}

export async function getDailyWeather(
  city: string,
  apiKey: string
): Promise<WeatherInfo> {
  const url = new URL("https://restapi.amap.com/v3/weather/weatherInfo");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("city", city);
  url.searchParams.set("extensions", "all");

  const response = await fetch(url.toString());
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Weather API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as AmapForecastResponse;
  if (data.status !== "1") {
    throw new Error(
      `Amap API error ${data.infocode ?? "unknown"}: ${data.info ?? "unknown"}`
    );
  }

  const cast = data.forecasts?.[0]?.casts?.[0];
  if (!cast) {
    throw new Error("Amap API response missing forecast data");
  }

  const maxTemp = toNumber(cast.daytemp);
  const minTemp = toNumber(cast.nighttemp);
  if (maxTemp === undefined || minTemp === undefined) {
    throw new Error("Amap API response missing temperature data");
  }

  const condition = cast.dayweather || cast.nightweather || "天气多变";

  return {
    condition,
    minTempC: roundTemp(minTemp),
    maxTempC: roundTemp(maxTemp),
  };
}

interface AmapForecastResponse {
  status?: string;
  info?: string;
  infocode?: string;
  forecasts?: Array<{
    casts?: Array<{
      dayweather?: string;
      nightweather?: string;
      daytemp?: string;
      nighttemp?: string;
    }>;
  }>;
}

function roundTemp(value: number): number {
  return Math.round(value);
}

function toNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
