import { motion } from 'motion/react';
import { COUPLE, EVENT } from './invite';
import { still } from './still';

const rise = (delay: number) => ({
  initial: still ? false : { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { delay, duration: 1.1, ease: [0.2, 0.8, 0.2, 1] as const },
});

const pad = (n: number) => String(n).padStart(2, '0');

export function Closing() {
  return (
    <footer className="closing">
      <motion.p className="script closing-names" {...rise(0)}>
        {COUPLE.groomFirst} &amp; {COUPLE.brideFirst}
      </motion.p>
      <motion.p className="caps closing-date" {...rise(0.2)}>
        {pad(EVENT.getDate())} · {pad(EVENT.getMonth() + 1)} · {EVENT.getFullYear()}
      </motion.p>

      <motion.div className="closing-follow" {...rise(0.5)}>
        <span className="closing-rule" />
        <p className="closing-follow-text">See you there</p>
        <span className="closing-rule" />
      </motion.div>
    </footer>
  );
}
