// Single source of truth for the invitation details, guest naming and links.

export const COUPLE = {
  groom: 'Shuwaikh Faleel',
  bride: 'Amira Badawy',
  groomFirst: 'Shuwaikh',
  brideFirst: 'Amira',
  groomParents: 'Mr. & Mrs. Faleel Abdul Samad',
  brideParents: 'Mr. & Mrs. Adel Badawy',
};

/** Sunday, 27 December 2026, 7:30 PM (Sri Lanka time). */
export const EVENT = new Date(2026, 11, 27, 19, 30);

/** RSVP closes one week before the reception (end of that day). */
export const RSVP_DEADLINE = new Date(
  EVENT.getFullYear(),
  EVENT.getMonth(),
  EVENT.getDate() - 7,
  23,
  59,
  59,
);

export const VENUE = {
  hall: 'Centrium Ballroom',
  hotel: 'Avenra Garden Hotel',
  city: 'Negombo, Sri Lanka',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Avenra+Garden+Hotel+Negombo',
};

/** `number` is what's shown; the `tel:` link strips the spaces. */
export const RSVP_PHONES: { number: string; name?: string }[] = [
  { number: '0777651797' },
  { number: '0787651797' },
  { number: '0725880846', name: 'Fathima Faleel' },
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const weekday = (d: Date) => WEEKDAYS[d.getDay()];
export const longDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const monthName = (d: Date) => MONTHS[d.getMonth()];

/** "Sunday, 20 December 2026" */
export const RSVP_BY = `${weekday(RSVP_DEADLINE)}, ${longDate(RSVP_DEADLINE)}`;

const pad = (n: number) => String(n).padStart(2, '0');
const stamp = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

export const CALENDAR_URL = (() => {
  const end = new Date(EVENT.getTime() + 3.5 * 3600_000);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Wedding Reception · ${COUPLE.groomFirst} & ${COUPLE.brideFirst}`,
    dates: `${stamp(EVENT)}/${stamp(end)}`,
    ctz: 'Asia/Colombo',
    location: `${VENUE.hall}, ${VENUE.hotel}, ${VENUE.city}`,
    details: 'Kindly be seated by 8:15 pm, as dinner will be served promptly at 8:30 pm.',
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
})();

/* ───────── Guest naming ───────── */

export const PREFIXES = ['Mr.', 'Mrs.', 'Miss', 'Mr. & Mrs.', 'Family', 'Dear'] as const;
export type Prefix = (typeof PREFIXES)[number];

const tidy = (s: string) => s.replace(/\s+/g, ' ').trim();

/**
 * Combines prefix + name for display.
 * "Dear" is a greeting style, not a title — it never appears in the display name,
 * because the message itself already starts with "Dear".
 */
export function toDisplayName(prefix: string, rawName: string): string {
  let name = tidy(rawName);
  // Avoid "Mr. Mr. Sanjaya" / "Dear Dear Sanjaya" when the prefix was typed into the name too.
  for (const p of [prefix, 'Dear']) {
    if (p && name.toLowerCase().startsWith(p.toLowerCase() + ' ')) name = tidy(name.slice(p.length));
  }
  if (!name) return '';
  switch (prefix) {
    case 'Family':
      return `${name} and Family`;
    case 'Dear':
      return name;
    default:
      return `${prefix} ${name}`;
  }
}

/** `{origin}/{displayName}` with the name safely URL-encoded. */
export const inviteLink = (origin: string, displayName: string) =>
  `${origin.replace(/\/+$/, '')}/${encodeURIComponent(displayName)}`;

export const greeting = (displayName: string) => `Dear ${displayName},`;

export const inviteMessage = (displayName: string, link: string) =>
  `${greeting(displayName)}

With joyful hearts, we warmly invite you to join us in celebrating one of the most special days of our lives as we begin this beautiful journey together. 🤍

You can view our wedding reception invitation and all the event details through the personalised link below 🌐:

${link}

Your presence would mean the world to us, and we would be truly honoured to have you share in this special occasion and celebrate this beautiful moment with us.

With warm regards,

${COUPLE.groomParents}

On behalf of the couple,
${COUPLE.groom} & ${COUPLE.bride} 🤍`;

/** Reads the guest display name from `/{name}` (or the legacy `?prefix=&name=` links). */
export function readGuest(): string {
  const qs = new URLSearchParams(window.location.search);
  const legacy = qs.get('name');
  if (legacy) return toDisplayName(qs.get('prefix') || 'Dear', legacy).slice(0, 80);

  const seg = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!seg || seg.includes('/') || seg.toLowerCase() === 'admin') return '';
  try {
    return tidy(decodeURIComponent(seg)).slice(0, 80);
  } catch {
    return '';
  }
}
