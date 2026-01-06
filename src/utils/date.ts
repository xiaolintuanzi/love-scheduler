export function formatDateInTimeZone(date: Date, timeZone: string): string {
  const parts = getDatePartsInTimeZone(date, timeZone);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function getDatePartsInTimeZone(
  date: Date,
  timeZone: string
): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
}

export function daysTogetherInclusive(startDate: string, endDate: string): number {
  const startParts = parseDate(startDate);
  const endParts = parseDate(endDate);
  const startUtc = Date.UTC(
    startParts.year,
    startParts.month - 1,
    startParts.day
  );
  const endUtc = Date.UTC(endParts.year, endParts.month - 1, endParts.day);
  const diffDays = Math.floor((endUtc - startUtc) / 86_400_000);
  return Math.max(0, diffDays + 1);
}

function parseDate(value: string): { year: number; month: number; day: number } {
  const [year, month, day] = value.split("-").map((part) => Number(part));
  return { year, month, day };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
