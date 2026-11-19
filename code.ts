// @ts-nocheck
/**
 * Shuwaikh & Amira — RSVP + Wishes backend (Google Apps Script)
 *
 * SETUP
 * 1. Open the sheet → Extensions › Apps Script.
 * 2. Replace everything in Code.gs with this file and Save.
 * 3. Run `setup` once from the toolbar (approve the permissions).
 *    → creates the "RSVP" and "Wishes" tabs with styled headers.
 * 4. Deploy › New deployment › Web app
 *      Execute as: Me      Who has access: Anyone
 * 5. Copy the /exec URL into the site's .env (and Vercel env vars):
 *      VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
 * 6. After editing this script: Deploy › Manage deployments › Edit › New version.
 *
 * The tabs are also created automatically on the first submission if missing.
 * Untick "Show on Website" in the Wishes tab to hide a wish from the site.
 */

const SPREADSHEET_ID = '19cGfCguwopxHsiQ1A4kFKDTnNUGDcV9tf0YD5gfC6Ok';
const TIMEZONE = 'Asia/Colombo';

const SHEETS = {
  RSVP: {
    name: 'RSVP',
    headers: ['Submitted', 'Invited As', 'Name', 'Phone', 'Attendance', 'Guests', 'Note', 'Last Updated'],
    widths: [160, 180, 200, 140, 170, 80, 320, 160],
    textCols: [4], // Phone — keep leading zeros
    wrapCols: [7],
  },
  WISHES: {
    name: 'Wishes',
    headers: ['Submitted', 'Name', 'Wish', 'Show on Website'],
    widths: [160, 200, 460, 140],
    textCols: [],
    wrapCols: [3],
  },
};

const HEADER_BG = '#123c2c'; // emerald
const HEADER_FG = '#f6f4ec'; // paper
const ACCENT = '#b8955a'; // gold

/* ───────────────────────── Entry points ───────────────────────── */

/** Run once manually to create both tabs with headers. */
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureSheet_(ss, SHEETS.RSVP);
  ensureSheet_(ss, SHEETS.WISHES);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const p = parsePayload_(e);
    const key = String(p.sheet || '').trim().toUpperCase();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (key === 'RSVP') return json_(saveRsvp_(ss, p));
    if (key === 'WISHES' || key === 'WISH') return json_(saveWish_(ss, p));
    return json_({ ok: false, error: 'Unknown sheet. Use "RSVP" or "Wishes".' });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || '';
    if (action === 'wishes') {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      return json_({ ok: true, wishes: listWishes_(ss, 60) });
    }
    return json_({ ok: true, message: 'Wedding RSVP & Wishes endpoint is running.' });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

/* ───────────────────────── RSVP ───────────────────────── */

function saveRsvp_(ss, p) {
  const sheet = ensureSheet_(ss, SHEETS.RSVP);

  const name = clean_(p.name, 120);
  // Phone column is plain-text formatted, so only allow phone characters (no formula escape needed).
  const phone = String(p.phone || '').replace(/[^\d+\s-]/g, '').trim().slice(0, 30);
  if (!name) return { ok: false, error: 'Name is required.' };
  if (!phone) return { ok: false, error: 'Phone number is required.' };

  const attending = String(p.attendance || '').toLowerCase() !== 'no';
  const guests = attending ? clampInt_(p.guests, 1, 20, 1) : 0;
  const now = new Date();

  const row = [
    now,
    clean_(p.invitedAs, 120),
    name,
    phone,
    attending ? 'Joyfully accepts' : 'Regretfully declines',
    guests,
    clean_(p.message, 1000),
    '',
  ];

  // Same phone number again → update that guest's response instead of duplicating it.
  const existing = findRowByPhone_(sheet, phone);
  let rowIndex;
  if (existing) {
    row[0] = sheet.getRange(existing, 1).getValue() || now;
    row[7] = now;
    sheet.getRange(existing, 1, 1, row.length).setValues([row]);
    rowIndex = existing;
  } else {
    sheet.appendRow(row);
    rowIndex = sheet.getLastRow();
  }

  sheet
    .getRange(rowIndex, 5)
    .setFontColor(attending ? '#1f6b4a' : '#a4453f')
    .setFontWeight('bold');

  return { ok: true, updated: Boolean(existing) };
}

function findRowByPhone_(sheet, phone) {
  const target = digits_(phone).slice(-9);
  if (target.length < 7) return 0;
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const values = sheet.getRange(2, 4, last - 1, 1).getDisplayValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (digits_(values[i][0]).slice(-9) === target) return i + 2;
  }
  return 0;
}

/* ───────────────────────── Wishes ───────────────────────── */

function saveWish_(ss, p) {
  const sheet = ensureSheet_(ss, SHEETS.WISHES);
  const name = clean_(p.name, 120);
  const message = clean_(p.message, 1000);
  if (!name || !message) return { ok: false, error: 'Name and wish are required.' };

  sheet.appendRow([new Date(), name, message, true]);
  sheet.getRange(sheet.getLastRow(), 4).insertCheckboxes().check();
  return { ok: true };
}

function listWishes_(ss, limit) {
  const sheet = ss.getSheetByName(SHEETS.WISHES.name);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  const out = [];
  for (let i = rows.length - 1; i >= 0 && out.length < limit; i--) {
    const [date, name, message, show] = rows[i];
    if (show === false || !message) continue;
    out.push({
      name: stripQuote_(name),
      message: stripQuote_(message),
      date: date instanceof Date ? Utilities.formatDate(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss") : '',
    });
  }
  return out;
}

/* ───────────────────────── Sheet helpers ───────────────────────── */

/** Gets the tab, creating it with formatted headers if it doesn't exist (or has no headers). */
function ensureSheet_(ss, def) {
  let sheet = ss.getSheetByName(def.name);
  if (!sheet) sheet = ss.insertSheet(def.name);

  const width = def.headers.length;
  const current = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  if (current.join('|') === def.headers.join('|')) return sheet;

  // Only write headers onto an empty first row — never overwrite existing data.
  if (current.some(String) && sheet.getLastRow() > 0) {
    sheet.insertRowBefore(1);
  }

  const header = sheet.getRange(1, 1, 1, width);
  header
    .setValues([def.headers])
    .setFontWeight('bold')
    .setFontColor(HEADER_FG)
    .setBackground(HEADER_BG)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(null, null, true, null, null, null, ACCENT, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.setRowHeight(1, 34);
  sheet.setFrozenRows(1);

  def.widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setNumberFormat('dd mmm yyyy, h:mm am/pm');
  def.textCols.forEach((c) => sheet.getRange(2, c, sheet.getMaxRows() - 1, 1).setNumberFormat('@'));
  def.wrapCols.forEach((c) => sheet.getRange(2, c, sheet.getMaxRows() - 1, 1).setWrap(true));
  if (def === SHEETS.RSVP) {
    sheet.getRange(2, 8, sheet.getMaxRows() - 1, 1).setNumberFormat('dd mmm yyyy, h:mm am/pm');
  }

  return sheet;
}

/* ───────────────────────── Utils ───────────────────────── */

function parsePayload_(e) {
  const params = (e && e.parameter) || {};
  if (Object.keys(params).length) return params;
  const body = (e && e.postData && e.postData.contents) || '';
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch (_) {
    const out = {};
    body.split('&').forEach((pair) => {
      if (!pair) return;
      const i = pair.indexOf('=');
      const k = decodeURIComponent((i < 0 ? pair : pair.slice(0, i)).replace(/\+/g, ' '));
      const v = i < 0 ? '' : decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '));
      out[k] = v;
    });
    return out;
  }
}

/** Trim, cap length, and neutralise spreadsheet formulas (=, +, -, @). */
function clean_(value, max) {
  let s = String(value == null ? '' : value).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function stripQuote_(v) {
  return String(v == null ? '' : v).replace(/^'/, '');
}

function digits_(v) {
  return String(v || '').replace(/\D/g, '');
}

function clampInt_(v, min, max, fallback) {
  const n = parseInt(v, 10);
  if (isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
