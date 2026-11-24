import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Loader2, Send } from 'lucide-react';
import { submitToSheet } from './sheets';
import { still } from './still';

const rise = (delay = 0) => ({
  initial: still ? false : { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { delay, duration: 1, ease: [0.2, 0.8, 0.2, 1] as const },
});

export function Wishes({ guest }: { guest: string }) {
  const [name, setName] = useState(guest);
  const [message, setMessage] = useState('');
  const [showDua, setShowDua] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const wish = { name: name.trim(), message: message.trim() };
    if (!wish.name || !wish.message) return;
    setStatus('sending');
    try {
      await submitToSheet('Wishes', wish);
      setMessage('');
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <section className="wishes" id="wishes">
      <motion.div className="section-head" {...rise()}>
        <p className="caps section-kicker">Share your duas &amp; blessings</p>
        <h2 className="script section-title">Wishes</h2>
      </motion.div>

      <motion.form className="paper-card form-card form" onSubmit={submit} {...rise(0.15)}>
        <label className="field">
          <span className="caps field-label">Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
        </label>
        <label className="field">
          <span className="caps field-label">Your wish</span>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (status === 'done') setStatus('idle');
            }}
            required
            maxLength={600}
            placeholder="Write a few words for the couple…"
          />
        </label>
        <button className="pill-btn solid" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? <Loader2 size={16} className="spin" /> : <Send size={15} />}
          {status === 'sending' ? 'Sending' : 'Send wish'}
        </button>
        {status === 'done' && <p className="form-ok">Jazakallah khair! Your wish has been sent.</p>}
        {status === 'error' && <p className="form-error">Something went wrong. Please try again.</p>}
      </motion.form>

      <motion.div className="dua" {...rise(0.2)}>
        <button
          className="pill-btn"
          type="button"
          aria-expanded={showDua}
          aria-controls="dua-text"
          onClick={() => setShowDua((v) => !v)}
        >
          Dua for new wedded couple
          <ChevronDown size={15} className={`dua-chevron ${showDua ? 'is-open' : ''}`} />
        </button>

        <AnimatePresence initial={false}>
          {showDua && (
            <motion.div
              id="dua-text"
              className="paper-card dua-card"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <p className="dua-ar" lang="ar" dir="rtl">
                بَارَكَ ٱللَّٰهُ لَكَ وَبَارَكَ عَلَيْكَ
                <br />
                وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
              </p>
              <p className="dua-en">
                “May Allah bless you, shower His blessings upon you, and unite you both in goodness.”
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
