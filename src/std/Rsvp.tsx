import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2, Phone } from 'lucide-react';
import { DiamondDivider } from './Ornaments';
import { RSVP_BY, RSVP_DEADLINE, RSVP_PHONES } from './invite';
import { submitToSheet } from './sheets';
import { still } from './still';

const rise = (delay = 0) => ({
  initial: still ? false : { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { delay, duration: 1, ease: [0.2, 0.8, 0.2, 1] as const },
});

type Attending = 'yes' | 'no';

export function Rsvp({ guest }: { guest: string }) {
  const [name, setName] = useState(guest);
  const [phone, setPhone] = useState('');
  const [attending, setAttending] = useState<Attending>('yes');
  const [guests, setGuests] = useState('1');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const closed = Date.now() > RSVP_DEADLINE.getTime();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setStatus('sending');
    try {
      await submitToSheet('RSVP', {
        invitedAs: guest,
        name: name.trim(),
        phone: phone.trim(),
        attendance: attending,
        guests: attending === 'yes' ? guests : '0',
        message: message.trim(),
      });
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <section className="rsvp" id="rsvp">
      <motion.div className="section-head" {...rise()}>
        <p className="caps section-kicker">Kindly respond</p>
        <h2 className="script section-title">RSVP</h2>
        <p className="rsvp-by">
          Please confirm your attendance on or before
          <strong>{RSVP_BY}</strong>
        </p>
      </motion.div>

      <motion.div className="paper-card form-card" {...rise(0.15)}>
        {status === 'done' ? (
          <div className="form-done">
            <span className="form-done-icon">
              <Check size={26} />
            </span>
            <p className="script form-done-title">
              {attending === 'yes' ? 'Thank you!' : 'You will be missed'}
            </p>
            <p className="form-done-text">
              {attending === 'yes'
                ? 'Your response has been received. We can’t wait to celebrate with you.'
                : 'Thank you for letting us know. We will keep you in our duas.'}
            </p>
            <button type="button" className="link-btn" onClick={() => setStatus('idle')}>
              Edit response
            </button>
          </div>
        ) : closed ? (
          <p className="form-done-text">
            Online RSVP has closed. Please contact us on the numbers below.
          </p>
        ) : (
          <form className="form" onSubmit={submit}>
            <div className="choice" role="radiogroup" aria-label="Attendance">
              {(
                [
                  ['yes', 'Joyfully accept'],
                  ['no', 'Regretfully decline'],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={attending === v}
                  className={`choice-btn ${attending === v ? 'is-on' : ''}`}
                  onClick={() => setAttending(v)}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="field">
              <span className="caps field-label">Your name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} autoComplete="name" />
            </label>

            <label className="field">
              <span className="caps field-label">Phone number</span>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={20}
                pattern="[0-9+\s\-]{7,20}"
                placeholder="07X XXX XXXX"
                autoComplete="tel"
              />
            </label>

            {attending === 'yes' && (
              <label className="field">
                <span className="caps field-label">Number of guests</span>
                <select value={guests} onChange={(e) => setGuests(e.target.value)}>
                  {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === '1' ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="field">
              <span className="caps field-label">Note (optional)</span>
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} />
            </label>

            <button className="pill-btn solid" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? <Loader2 size={16} className="spin" /> : null}
              {status === 'sending' ? 'Sending' : 'Send RSVP'}
            </button>
            {status === 'error' && (
              <p className="form-error">Something went wrong. Please try again or call us below.</p>
            )}
          </form>
        )}
      </motion.div>

      <motion.div className="rsvp-phones" {...rise(0.2)}>
        <DiamondDivider width="min(70vw, 300px)" />
        <p className="caps rsvp-phones-label">RSVP</p>
        <div className="rsvp-phones-list">
          {RSVP_PHONES.map((p) => (
            <a key={p} href={`tel:${p}`}>
              <Phone size={14} /> {p}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
