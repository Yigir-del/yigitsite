/** Samsun / Turkey civil time — Europe/Istanbul (UTC+3, no DST). */

export function istanbulParts(ts = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(ts));

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '0';

  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: Number(pick('hour')),
  };
}

export function istanbulDayKey(ts = Date.now()) {
  const { year, month, day } = istanbulParts(ts);
  return `${year}-${month}-${day}`;
}

export function istanbulMonthKey(ts = Date.now()) {
  const { year, month } = istanbulParts(ts);
  return `${year}-${month}`;
}

/** Day band for atmosphere: night is the default Muryokusho look. */
export function samsunSkyBand(ts = Date.now()): 'day' | 'dusk' | 'night' {
  const { hour } = istanbulParts(ts);
  if (hour >= 7 && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
}
