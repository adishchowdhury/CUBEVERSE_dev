import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, RefreshCw, Volume2, VolumeX, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateMusic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Relaxing lofi hip hop beats for speedcubing focus, chill vibes' }),
      });

      if (!response.ok) throw new Error('Failed to generate music');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setIsPlaying(true);
    } catch (error) {
      console.error('Music Generation Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  const togglePlay = () => {
    if (!audioUrl && !isLoading) {
      generateMusic();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-auto">
      <div className="flex items-center gap-2 glass-panel p-2 rounded-2xl border border-white/10 shadow-2xl">
        <AnimatePresence mode="wait">
          {audioUrl && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex items-center gap-3 px-3 overflow-hidden"
            >
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest text-[#00FF88] font-bold">Lofi Channel</span>
                <span className="text-[10px] text-white/70 whitespace-nowrap">Neural Beats Alpha</span>
              </div>
              
              <div className="flex items-center gap-1">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: isPlaying ? [4, 12, 6, 10, 4] : 4
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                    className="w-1 bg-[#00FF88]/60 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            disabled={isLoading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isLoading ? 'bg-white/5' : audioUrl && isPlaying ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isLoading ? (
              <RefreshCw size={18} className="animate-spin text-white/40" />
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="translate-x-0.5" />
            )}
          </motion.button>

          {audioUrl && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={generateMusic}
              disabled={isLoading}
              className="w-10 h-10 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all"
              title="Regenerate Track"
            >
              <RefreshCw size={16} />
            </motion.button>
          )}
        </div>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          loop
          muted={isMuted}
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}
