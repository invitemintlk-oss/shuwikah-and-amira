import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { still } from './still';

const rise = (delay: number) => ({
  initial: still ? false : { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { delay, duration: 1.1, ease: [0.2, 0.8, 0.2, 1] as const },
});

/** "Dua for new wedded couple" button that reveals the Arabic dua when tapped. */
export function Dua() {
  const [showDua, setShowDua] = useState(false);

  return (
    <motion.div className="dua" {...rise(0.7)}>
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
            className="dua-card"
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
  );
}
