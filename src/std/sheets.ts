// Talks to the Google Apps Script web app (see /code.ts).

const DEFAULT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzmJL2vH1IJiWkt_Y9VMZR-MXl7IF3SDT57Xa8h2XrUO3h9ugiNA6JI8TtSH38HzGN6qQ/exec';

// An env var still overrides it, but the deployed web app URL works out of the box.
const SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL?.trim() || DEFAULT_SCRIPT_URL;

export type Wish = { name: string; message: string; date?: string };

export async function submitToSheet(sheet: 'RSVP' | 'Wishes', data: Record<string, string>) {
  if (!SCRIPT_URL) throw new Error('VITE_GOOGLE_APPS_SCRIPT_URL is not set');
  // Form-encoded + no-cors = a "simple" request: no preflight, which Apps Script can't answer.
  await fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams({ sheet, ...data }),
  });
}

export async function fetchWishes(): Promise<Wish[]> {
  if (!SCRIPT_URL) return [];
  const res = await fetch(`${SCRIPT_URL}?action=wishes`);
  const json = await res.json();
  return json && json.ok && Array.isArray(json.wishes) ? json.wishes : [];
}
