import { useEffect, useState, type FormEvent } from 'react';
import { Check, Copy, Link as LinkIcon, MessageSquareText } from 'lucide-react';
import { DiamondDivider } from './std/Ornaments';
import {
  COUPLE,
  PREFIXES,
  greeting,
  inviteLink,
  inviteMessage,
  toDisplayName,
  type Prefix,
} from './std/invite';

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older / non-secure contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

export function AdminPage() {
  const [prefix, setPrefix] = useState<Prefix>('Mr.');
  const [guestName, setGuestName] = useState('');
  const [result, setResult] = useState<{ displayName: string; link: string; message: string } | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.title = `Invitation Links · ${COUPLE.groomFirst} & ${COUPLE.brideFirst}`;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const preview = toDisplayName(prefix, guestName);

  const generate = (e: FormEvent) => {
    e.preventDefault();
    if (!preview) return;
    const link = inviteLink(window.location.origin, preview);
    setResult({ displayName: preview, link, message: inviteMessage(preview, link) });
  };

  // Copy buttons stay disabled until a link has been generated for the current inputs.
  const stale = !result || result.displayName !== preview;

  const copy = async (text: string, label: string) => {
    await copyText(text);
    setToast(label);
  };

  return (
    <div className="admin">
      <div className="admin-card paper-card">
        <header className="admin-head">
          <p className="caps section-kicker">
            {COUPLE.groomFirst} &amp; {COUPLE.brideFirst}
          </p>
          <h1 className="script section-title">Invitation Links</h1>
          <DiamondDivider width="min(70vw, 300px)" />
        </header>

        <form className="form" onSubmit={generate}>
          <label className="field">
            <span className="caps field-label">Select prefix</span>
            <select value={prefix} onChange={(e) => setPrefix(e.target.value as Prefix)}>
              {PREFIXES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="caps field-label">Guest name</span>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Sanjaya"
              maxLength={60}
              autoFocus
            />
          </label>

          <p className="admin-greeting" aria-live="polite">
            {preview ? greeting(preview) : <span className="admin-muted">Greeting preview appears here</span>}
          </p>

          <button className="pill-btn solid" type="submit" disabled={!preview}>
            <LinkIcon size={15} /> Generate link
          </button>
        </form>

        {result && (
          <div className={`admin-result ${stale ? 'is-stale' : ''}`}>
            <span className="caps field-label">Invitation link</span>
            <a className="admin-link" href={result.link} target="_blank" rel="noreferrer">
              {result.link}
            </a>

            <span className="caps field-label">Message preview</span>
            <pre className="admin-message">{result.message}</pre>
            {stale && <p className="admin-muted">Inputs changed — generate again to update.</p>}
          </div>
        )}

        <div className="btn-row admin-actions">
          <button className="pill-btn" type="button" disabled={stale} onClick={() => copy(result!.link, 'Link copied!')}>
            <Copy size={15} /> Copy link only
          </button>
          <button
            className="pill-btn"
            type="button"
            disabled={stale}
            onClick={() => copy(result!.message, 'Message copied!')}
          >
            <MessageSquareText size={15} /> Copy full message
          </button>
        </div>
      </div>

      <div className={`toast ${toast ? 'is-on' : ''}`} role="status">
        <Check size={15} /> {toast}
      </div>
    </div>
  );
}
