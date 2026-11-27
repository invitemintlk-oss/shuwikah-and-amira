import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, CalendarPlus, Clock, MapPin, Navigation } from 'lucide-react';
import { DiamondDivider, HeartDivider } from './Ornaments';
import { CALENDAR_URL, EVENT, RSVP_BY, VENUE, longDate, weekday } from './invite';
import { still } from './still';

const rise = (delay = 0) => ({
  initial: still ? false : { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { delay, duration: 1, ease: [0.2, 0.8, 0.2, 1] as const },
});

const ROWS: { icon: ReactNode; lines: string[] }[] = [
  { icon: <CalendarDays strokeWidth={1.6} />, lines: [weekday(EVENT), longDate(EVENT)] },
  { icon: <Clock strokeWidth={1.6} />, lines: ['7:30 pm'] },
  { icon: <MapPin strokeWidth={1.6} />, lines: [VENUE.hall, VENUE.hotel, VENUE.city] },
];

export function Details() {
  return (
    <section className="details" id="details">
      <motion.div className="section-head" {...rise()}>
        <p className="caps section-kicker">Join us for the</p>
        <h2 className="script section-title">Wedding Reception</h2>
      </motion.div>

      <motion.div className="paper-card details-card" {...rise(0.15)}>
        {ROWS.map((r, i) => (
          <Fragment key={i}>
            {i > 0 && <DiamondDivider width="100%" />}
            <div className="detail-row">
              <span className="detail-icon">{r.icon}</span>
              <span className="detail-sep" />
              <p className="detail-text">
                {r.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </p>
            </div>
          </Fragment>
        ))}
        <DiamondDivider width="100%" />
        <p className="details-note">
          Kindly be seated by 8:15 pm,
          <br />
          as dinner will be served promptly at 8:30 pm
        </p>
      </motion.div>

      <motion.div className="btn-row" {...rise(0.25)}>
        <a className="pill-btn" href={VENUE.mapsUrl} target="_blank" rel="noreferrer">
          <Navigation size={15} /> Directions
        </a>
        <a className="pill-btn" href={CALENDAR_URL} target="_blank" rel="noreferrer">
          <CalendarPlus size={15} /> Add to calendar
        </a>
      </motion.div>

      <motion.div className="details-cal" {...rise(0.1)}>
        <div className="paper-card rsvp-note">
          <p className="caps section-kicker">Kindly respond</p>
          <p className="rsvp-by">
            Please confirm your attendance on or before
            <strong>{RSVP_BY}</strong>
          </p>
          <a className="pill-btn" href="#rsvp">
            RSVP now
          </a>
        </div>
        <Countdown />
      </motion.div>

      <img src="/leaves-bottom.png" alt="" className="leaf-art leaf-art-reveal" />
    </section>
  );
}

function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, EVENT.getTime() - now);
  const parts = [
    { v: Math.floor(diff / 86400000), l: 'Days' },
    { v: Math.floor(diff / 3600000) % 24, l: 'Hours' },
    { v: Math.floor(diff / 60000) % 60, l: 'Minutes' },
    { v: Math.floor(diff / 1000) % 60, l: 'Seconds' },
  ];

  return (
    <div className="countdown">
      <HeartDivider width="min(60vw, 260px)" />
      <div className="countdown-row">
        {parts.map((p) => (
          <div key={p.l} className="countdown-item">
            <span className="countdown-num">{String(p.v).padStart(2, '0')}</span>
            <span className="caps countdown-label">{p.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
