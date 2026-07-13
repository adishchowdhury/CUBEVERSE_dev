import React, { useRef, useEffect } from 'react';
import { Play, Pause, RefreshCw, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCubeStore } from '../store';

export function MusicPlayer() {
  const isPlaying = useCubeStore(s => s.isMusicPlaying);
  const setIsPlaying = useCubeStore(s => s.setIsMusicPlaying);
  const isLoading = useCubeStore(s => s.isMusicLoading);
  const setIsLoading = useCubeStore(s => s.setIsMusicLoading);
  const audioUrl = useCubeStore(s => s.musicAudioUrl);
  const setAudioUrl = useCubeStore(s => s.setMusicAudioUrl);
  
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
      if (isPlaying && audioUrl) {
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
      <div className="flex items-center gap-2 glass-panel-apple p-2 rounded-2xl transition-all duration-500 hover:scale-105 shadow-[0_4px_30px_rgba(0,0,0,0.4)] border border-white/10 btn-shimmer">
        <AnimatePresence mode="wait">
          {audioUrl && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex items-center gap-3 px-3 overflow-hidden"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase">Lofi Beats</span>
                <span className="text-[10px] font-medium text-[#00D1FF] calligraphy truncate max-w-[80px]">Active Track</span>
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
                    className="w-1 bg-[#00D1FF] rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            disabled={isLoading}
            className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all duration-300 ${
              isLoading 
                ? 'bg-white/5' 
                : audioUrl && isPlaying 
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                  : 'bg-white/10 text-white hover:bg-white/20 hover:text-[#00D1FF]'
            }`}
          >
            {isLoading ? (
              <RefreshCw size={18} className="animate-spin text-white/40" />
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="translate-x-0.5 text-[#00D1FF]" />
            )}
          </motion.button>
          
          {audioUrl && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateMusic}
              disabled={isLoading}
              className="w-10 h-10 rounded-[14px] bg-white/5 text-white/40 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all duration-300"
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
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}
