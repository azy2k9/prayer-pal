import type { PrayerName, PrayerWindow } from './types';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DAILY_PRAYERS: readonly PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export function prayersForDate(prayerDate: string): readonly PrayerName[] {
  const weekday = new Date(`${prayerDate}T12:00:00.000Z`).getUTCDay();
  return weekday === 5 ? ['Fajr', 'Jumuah', 'Asr', 'Maghrib', 'Isha'] : DAILY_PRAYERS;
}

export function dayLabelForDate(prayerDate: string): string {
  const date = new Date(`${prayerDate}T12:00:00.000Z`);
  return WEEKDAY_NAMES[date.getUTCDay()];
}

export function localDateFor(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function localDateTimeToUtc(prayerDate: string, time: string, timeZone: string): Date {
  const guess = Date.parse(`${prayerDate}T${time}:00.000Z`);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(guess));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const localAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour) % 24,
    Number(values.minute),
  );
  return new Date(guess - (localAsUtc - guess));
}

export function nextPrayer(prayers: PrayerWindow[], now: Date): PrayerName | null {
  return prayers.find((prayer) => new Date(prayer.endsAt) > now)?.prayer ?? null;
}
