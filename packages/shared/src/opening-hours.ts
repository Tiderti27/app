import type { OpeningHours } from "./types";

const DAY_ORDER: (keyof OpeningHours)[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const DAY_LABEL_SHORT: Record<keyof OpeningHours, string> = {
  mon: "Mo",
  tue: "Di",
  wed: "Mi",
  thu: "Do",
  fri: "Fr",
  sat: "Sa",
  sun: "So",
};

function formatDayList(days: (keyof OpeningHours)[]): string {
  const sorted = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
  const chunks: string[] = [];
  let chunkStart = 0;

  for (let i = 1; i <= sorted.length; i++) {
    const isConsecutive = i < sorted.length && DAY_ORDER.indexOf(sorted[i]) === DAY_ORDER.indexOf(sorted[i - 1]) + 1;
    if (isConsecutive) continue;

    const chunk = sorted.slice(chunkStart, i);
    chunks.push(
      chunk.length >= 3
        ? `${DAY_LABEL_SHORT[chunk[0]]}–${DAY_LABEL_SHORT[chunk[chunk.length - 1]]}`
        : chunk.map((d) => DAY_LABEL_SHORT[d]).join(", ")
    );
    chunkStart = i;
  }

  return chunks.join(", ");
}

/**
 * Fasst Tage mit identischer Oeffnungszeit zu einer Zeile zusammen
 * (z.B. "Mo-Fr 09:00-18:00"), alles andere steht in eigenen Zeilen,
 * sortiert nach Wochentag.
 */
export function formatOpeningHours(hours: OpeningHours | null | undefined): string[] {
  if (!hours) return [];

  const present = DAY_ORDER.filter((day) => hours[day]);
  if (present.length === 0) return [];

  const groups = new Map<string, (keyof OpeningHours)[]>();
  for (const day of present) {
    const time = hours[day] as string;
    const list = groups.get(time) ?? [];
    list.push(day);
    groups.set(time, list);
  }

  const lines = [...groups.entries()].map(([time, days]) => ({
    time,
    days,
    sortKey: Math.min(...days.map((d) => DAY_ORDER.indexOf(d))),
  }));

  lines.sort((a, b) => a.sortKey - b.sortKey);

  return lines.map(({ time, days }) => `${formatDayList(days)} ${time}`);
}

function parseTimeToMinutes(value: string): number | null {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Prueft, ob ein Spot gerade (nach lokaler Geraetezeit) geoeffnet hat.
 * Erwartet Werte im Format "HH:MM-HH:MM"; Zeitraeume, die ueber Mitternacht
 * gehen (z.B. "20:00-02:00"), werden korrekt behandelt. Fehlt ein Eintrag
 * fuer den aktuellen Wochentag oder ist das Format ungueltig, gilt der Spot
 * als geschlossen.
 */
export function isOpenNow(hours: OpeningHours | null | undefined, now: Date = new Date()): boolean {
  if (!hours) return false;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  // getDay(): 0=So, 1=Mo, ... -- DAY_ORDER ist Mo-So, daher Index -1 mod 7.
  const todayIndex = (now.getDay() + 6) % 7;
  const todayKey = DAY_ORDER[todayIndex];
  const yesterdayKey = DAY_ORDER[(todayIndex + 6) % 7];

  const todayRange = hours[todayKey];
  if (todayRange) {
    const [start, end] = todayRange.split("-").map((s) => s.trim());
    const startMin = start ? parseTimeToMinutes(start) : null;
    const endMin = end ? parseTimeToMinutes(end) : null;
    if (startMin !== null && endMin !== null) {
      if (endMin > startMin) {
        if (nowMinutes >= startMin && nowMinutes < endMin) return true;
      } else {
        // Ueber Mitternacht hinaus geoeffnet (z.B. 20:00-02:00).
        if (nowMinutes >= startMin) return true;
      }
    }
  }

  // Falls gestern ueber Mitternacht hinaus geoeffnet war, kann das auch
  // den fruehen heutigen Morgen abdecken.
  const yesterdayRange = hours[yesterdayKey];
  if (yesterdayRange) {
    const [start, end] = yesterdayRange.split("-").map((s) => s.trim());
    const startMin = start ? parseTimeToMinutes(start) : null;
    const endMin = end ? parseTimeToMinutes(end) : null;
    if (startMin !== null && endMin !== null && endMin <= startMin && nowMinutes < endMin) return true;
  }

  return false;
}
