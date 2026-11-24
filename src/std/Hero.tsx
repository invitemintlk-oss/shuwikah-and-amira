import { motion } from 'motion/react';
import { Ampersand, DiamondDivider } from './Ornaments';
import { COUPLE } from './invite';
import { still } from './still';

const up = (ready: boolean, delay: number) => ({
  initial: still ? false : { opacity: 0, y: 22, filter: 'blur(6px)' },
  animate: ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined,
  transition: { delay, duration: 1.2, ease: [0.2, 0.8, 0.2, 1] as const },
});

export function Hero({ ready, guest }: { ready: boolean; guest: string }) {
  return (
    <section className="hero">
      <motion.img
        src="/leaves-top.png"
        alt=""
        className="leaf-art leaf-art-top"
        initial={still ? false : { opacity: 0, x: 40, y: -40 }}
        animate={ready ? { opacity: 1, x: 0, y: 0 } : undefined}
        transition={{ delay: 0.6, duration: 2, ease: 'easeOut' }}
      />
      <motion.img
        src="/leaves-bottom.png"
        alt=""
        className="leaf-art leaf-art-bottom"
        initial={still ? false : { opacity: 0, x: -40, y: 40 }}
        animate={ready ? { opacity: 1, x: 0, y: 0 } : undefined}
        transition={{ delay: 0.8, duration: 2, ease: 'easeOut' }}
      />

      <div className="hero-inner">
        <motion.p className="bismillah" lang="ar" dir="rtl" {...up(ready, 0.9)}>
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </motion.p>
        <motion.p className="ayah-ar" lang="ar" dir="rtl" {...up(ready, 1)}>
          وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا
          <br />
          وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً
        </motion.p>
        <motion.div className="hero-rule" {...up(ready, 1.05)}>
          <DiamondDivider />
        </motion.div>
        <motion.blockquote className="verse" {...up(ready, 1.2)}>
          “And among His signs is that He created for you mates from among yourselves”
          <cite>(Surah Ar-Rum 30:21)</cite>
        </motion.blockquote>
        <motion.div className="hero-rule" {...up(ready, 1.35)}>
          <DiamondDivider />
        </motion.div>

        <motion.h1 className="script hero-name" {...up(ready, 1.6)}>
          {COUPLE.groom}
        </motion.h1>
        <motion.div {...up(ready, 1.85)}>
          <Ampersand />
        </motion.div>
        <motion.h1 className="script hero-name" {...up(ready, 2.05)}>
          {COUPLE.bride}
        </motion.h1>

        <motion.div className="parents" {...up(ready, 2.3)}>
          <p>{COUPLE.groomParents}</p>
          <em>and</em>
          <p>{COUPLE.brideParents}</p>
        </motion.div>

        <motion.p className="invite-line" {...up(ready, 2.5)}>
          request the pleasure of your presence
        </motion.p>

        {guest && (
          <motion.div className="guest" {...up(ready, 2.65)}>
            <span className="script guest-name">{guest}</span>
            <span className="guest-rule" />
          </motion.div>
        )}

        <motion.p className="invite-line" {...up(ready, 2.8)}>
          on the occasion of their wedding reception
          <br />
          of their son and daughter.
        </motion.p>
        <motion.p className="invite-line invite-line-close" {...up(ready, 2.95)}>
          We look forward to sharing this special day with you.
        </motion.p>

        <motion.a
          href="#details"
          className="scroll-cue"
          initial={still ? false : { opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 3.3, duration: 1 }}
        >
          <span className="scroll-cue-pill caps">View details</span>
          <svg className="scroll-cue-arrow" viewBox="0 0 24 24" aria-hidden>
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </div>
    </section>
  );
}
