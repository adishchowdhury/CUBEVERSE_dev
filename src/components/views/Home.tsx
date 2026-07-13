import { useState } from 'react';
import { motion } from 'motion/react';
import { useCubeStore } from '../../store';
import { Play, Pause, RefreshCw, Music } from 'lucide-react';

export function Home({ onHoverEnter, onHoverLeave, onBegin }: { onHoverEnter: () => void, onHoverLeave: () => void, onBegin: () => void }) {
  const isMusicPlaying = useCubeStore(s => s.isMusicPlaying);
  const setIsMusicPlaying = useCubeStore(s => s.setIsMusicPlaying);
  const isMusicLoading = useCubeStore(s => s.isMusicLoading);
  const setIsMusicLoading = useCubeStore(s => s.setIsMusicLoading);
  const musicAudioUrl = useCubeStore(s => s.musicAudioUrl);
  const setMusicAudioUrl = useCubeStore(s => s.setMusicAudioUrl);

  const [loadingStage, setLoadingStage] = useState('');

  const handleToggleMusic = async () => {
    if (!musicAudioUrl && !isMusicLoading) {
      setIsMusicLoading(true);
      
      try {
        // Multi-stage premium futuristic tuning simulation
        setLoadingStage('Syncing Audio Engine...');
        await new Promise(r => setTimeout(r, 600));
        setLoadingStage('Scanning Lo-Fi Waves...');
        await new Promise(r => setTimeout(r, 700));
        setLoadingStage('Harmonizing Stream...');
        
        const response = await fetch('/api/music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Relaxing lofi hip hop beats for speedcubing focus, chill vibes' }),
        });
        if (!response.ok) throw new Error('Failed to generate music');
        
        setLoadingStage('Optimizing Feed...');
        await new Promise(r => setTimeout(r, 500));
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setMusicAudioUrl(url);
        setIsMusicPlaying(true);
      } catch (error) {
        console.error('Music Generation Error:', error);
      } finally {
        setIsMusicLoading(false);
        setLoadingStage('');
      }
    } else {
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  return (
    <div className="flex flex-col w-full relative pointer-events-none gap-8 pb-12">
      <main className="flex-1 flex items-center justify-start py-4 pl-4 md:pl-[8%] lg:pl-[12%]">
        <div className="max-w-3xl pointer-events-auto">
          <motion.h1 
            initial={{ opacity: 0, filter: 'blur(12px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="select-none text-left"
          >
            <span className="font-calligraphy calligraphy text-5xl md:text-8xl lg:text-[7.5rem] font-light tracking-tight leading-none text-white block">
              The Most
            </span>
            <span className="font-sans tracking-[0.3em] uppercase text-2xl md:text-4xl text-white/50 block my-4 font-extralight">
              Beautiful
            </span>
            <span className="font-calligraphy calligraphy text-5xl md:text-8xl lg:text-[7.5rem] font-light tracking-tight leading-none text-white block">
              Solve.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="mt-8 text-sm md:text-base max-w-md leading-relaxed font-sans text-white/60 tracking-wide font-light border-l border-white/20 pl-6 text-left"
          >
            Enter a digital monument dedicated to the passion of speedcubing. Analyze your lookahead, track your galaxy of algorithms, and master the art.
          </motion.p>
        </div>
      </main>

      {/* Primary Actions Anchored Elegantly on the Left above Footer */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 pointer-events-auto z-20 pl-4 md:pl-[8%] lg:pl-[12%]"
      >
        <button 
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
          onClick={onBegin}
          className="btn-shimmer group relative px-10 py-4 bg-white text-black font-sans font-bold uppercase tracking-widest text-xs overflow-hidden rounded-full shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
        >
          <span className="relative z-10">Begin Experience</span>
        </button>
        
        <button 
          onClick={handleToggleMusic}
          disabled={isMusicLoading}
          className={`btn-shimmer group relative px-8 py-4 border rounded-full font-sans font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto text-center flex items-center justify-center gap-2 cursor-pointer ${
            isMusicPlaying
              ? 'bg-[#00D1FF]/20 border-[#00D1FF]/50 text-white shadow-[0_0_20px_rgba(0,209,255,0.3)]'
              : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          {isMusicLoading ? (
            <RefreshCw size={14} className="animate-spin text-[#00D1FF]" />
          ) : isMusicPlaying ? (
            <Pause size={14} className="text-[#00D1FF] animate-pulse" />
          ) : (
            <Music size={14} className="text-[#00D1FF]" />
          )}
          <span>
            {isMusicLoading 
              ? loadingStage 
              : isMusicPlaying 
                ? 'Stop Lofi Music' 
                : 'Lofi Focus Beats'}
          </span>
        </button>
      </motion.div>

      {/* Footer is only visible on the home view */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="w-full h-auto py-5 glass-panel-apple border-t-0 border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center px-6 md:px-8 justify-between gap-4 z-20 pointer-events-auto liquid-transition mt-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10 w-full">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[9px] md:text-[10px] text-white/30 uppercase tracking-[0.2em]">001 // INITIALIZATION</span>
            <span className="font-sans text-[9px] md:text-[10px] text-[#00D1FF] uppercase tracking-[0.2em] font-bold">LAT 34.0522 N / LON 118.2437 W</span>
          </div>
          <div className="hidden md:block w-[1px] h-8 bg-white/10"></div>
          <div className="flex flex-col gap-1">
             <span className="font-sans text-[9px] md:text-[10px] uppercase text-white/30 tracking-[0.2em]">Active Model</span>
             <span className="font-sans text-[9px] md:text-[10px] text-white uppercase tracking-[0.2em] font-bold">Cubeverse Engine Built by Adrija Chowdhury v4.0</span>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
