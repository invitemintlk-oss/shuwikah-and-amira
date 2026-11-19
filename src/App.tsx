import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Music, VolumeX } from 'lucide-react';
import { Intro } from './std/Intro';
import { Hero } from './std/Hero';
import { Details } from './std/Details';
import { Rsvp } from './std/Rsvp';
import { Wishes } from './std/Wishes';
import { Closing } from './std/Closing';
import { FallingLeaves } from './std/FallingLeaves';
import { still } from './std/still';
import { readGuest } from './std/invite';

export default function App() {
  const guest = useMemo(readGuest, []);
  const [opened, setOpened] = useState(still);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/paulyudin-wedding-485932.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => audio.pause();
  }, []);

  const play = () =>
    audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});

  const handleOpen = () => {
    play();
    setOpened(true);
  };

  const toggleMusic = () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      play();
    }
  };

  return (
    <div className="std-root">
      <AnimatePresence>{!opened && <Intro key="intro" onOpen={handleOpen} guest={guest} />}</AnimatePresence>

      {opened && (
        <>
          <motion.button
            className="std-music"
            onClick={toggleMusic}
            aria-label={playing ? 'Pause music' : 'Play music'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
          >
            {playing ? <Music size={17} /> : <VolumeX size={17} />}
          </motion.button>
          <FallingLeaves />
        </>
      )}

      <main className="std-main" aria-hidden={!opened}>
        <Hero ready={opened} guest={guest} />
        <Details />
        <Rsvp guest={guest} />
        <Wishes guest={guest} />
        <Closing />
      </main>
    </div>
  );
}
