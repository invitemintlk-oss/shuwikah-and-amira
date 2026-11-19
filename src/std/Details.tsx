import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, CalendarPlus, Clock, MapPin, Navigation } from 'lucide-react';
import { DiamondDivider, HeartDivider } from './Ornaments';
import { CALENDAR_URL, EVENT, VENUE, longDate, monthName, weekday } from './invite';
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
        <Calendar />
        <Countdown />
      </motion.div>

      <img src="/leaves-bottom.png" alt="" className="leaf-art leaf-art-reveal" />
    </section>
  );
}

function Calendar() {
  const year = EVENT.getFullYear();
  const month = EVENT.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <div className="cal">
      <div className="cal-head">
        <span className="script cal-month">{monthName(EVENT)}</span>
        <span className="caps cal-year">{year}</span>
      </div>
      <div className="cal-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="cal-dow">
            {d}
          </span>
        ))}
        {cells.map((n, i) => (
          <span key={i} className={`cal-day ${n === EVENT.getDate() ? 'is-event' : ''}`}>
            {n}
            {n === EVENT.getDate() && (
              <>
                <svg className="cal-circle" viewBox="0 0 60 60" aria-hidden>
                  <motion.path
                    d="M30 6 C 46 5, 55 17, 54 31 C 53 46, 41 55, 28 54 C 14 53, 5 43, 6 29 C 7 16, 18 7, 33 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={still ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 1.4, ease: 'easeInOut' }}
                  />
                </svg>
                <motion.svg
                  className="cal-heart"
                  viewBox="0 0 24 24"
                  aria-hidden
                  initial={still ? false : { scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.9, type: 'spring', bounce: 0.6 }}
                >
                  <path
                    fill="currentColor"
                    d="M12 21s-7.5-4.6-9.6-9.3C1 8.4 3.1 5 6.5 5c2 0 3.6 1.1 4.5 2.6C11.9 6.1 13.5 5 15.5 5 18.9 5 21 8.4 19.6 11.7 17.5 16.4 12 21 12 21z"
                  />
                </motion.svg>
              </>
            )}
          </span>
        ))}
      </div>
    </div>
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
