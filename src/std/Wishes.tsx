import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Loader2, Send } from 'lucide-react';
import { HeartDivider } from './Ornaments';
import { fetchWishes, submitToSheet, type Wish } from './sheets';
import { still } from './still';

const rise = (delay = 0) => ({
  initial: still ? false : { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { delay, duration: 1, ease: [0.2, 0.8, 0.2, 1] as const },
});

export function Wishes({ guest }: { guest: string }) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState(guest);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  useEffect(() => {
    fetchWishes()
      .then(setWishes)
      .catch(() => {});
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const wish = { name: name.trim(), message: message.trim() };
    if (!wish.name || !wish.message) return;
    setStatus('sending');
    try {
      await submitToSheet('Wishes', wish);
      setWishes((w) => [wish, ...w]);
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

      {wishes.length > 0 && (
        <div className="wish-list">
          <HeartDivider width="min(60vw, 260px)" />
          {wishes.map((w, i) => (
            <motion.figure
              key={`${w.name}-${i}`}
              className="wish"
              initial={still ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <blockquote>“{w.message}”</blockquote>
              <figcaption className="caps">{w.name}</figcaption>
            </motion.figure>
          ))}
        </div>
      )}
    </section>
  );
}
