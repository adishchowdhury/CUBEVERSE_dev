import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Library as LibraryIcon, Globe } from 'lucide-react';
import { Home } from './views/Home';
import { Nexus } from './views/Nexus';
import { Library } from './views/Library';
import { Galaxy } from './views/Galaxy';
import { ViewState, Solve } from '../App';
import { useCubeStore } from '../store';
import { useState, useEffect } from 'react';

function AchievementPopup() {
  const recentAchievement = useCubeStore(s => s.recentAchievement);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (recentAchievement) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 4000);
      return () => clearTimeout(t);
    }
  }, [recentAchievement]);

  return (
    <AnimatePresence>
      {show && recentAchievement && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] glass-panel px-6 py-4 rounded-2xl flex items-center gap-4 border border-[#00FF88]/30 shadow-[0_0_30px_rgba(0,255,136,0.2)] pointer-events-none"
        >
          <div className="w-10 h-10 rounded-full bg-[#00FF88]/20 flex items-center justify-center text-[#00FF88]">
            🏆
          </div>
          <div>
            <div className="text-[10px] text-[#00FF88] uppercase tracking-widest font-bold mb-1">Achievement Unlocked</div>
            <div className="text-white font-medium">{recentAchievement.title}</div>
            <div className="text-white/50 text-xs">{recentAchievement.subtitle}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ScoreDisplay() {
  const score = useCubeStore(s => s.score);
  return (
    <div className="flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full border-[#00D1FF]/40">
      <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">Score</span>
      <span className="font-mono text-sm text-[#00D1FF] font-bold">{score}</span>
    </div>
  );
}

export function Overlay({ 
  view, setView, solves, setSolves, isRunning, setIsRunning, onHoverEnter, onHoverLeave }: { 
  view: ViewState;
  setView: (v: ViewState) => void;
  solves: Solve[];
  setSolves: any;
  isRunning: boolean;
  setIsRunning: any;
  onHoverEnter: () => void; 
  onHoverLeave: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col text-[#E0E0E0] overflow-hidden">
      
      {/* Atmospheric Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00FF88] rounded-full bloom-light pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00D1FF] rounded-full bloom-light pointer-events-none z-0"></div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="h-16 flex items-center justify-between px-6 md:px-10 border-b border-white/5 z-20 glass-panel absolute top-0 left-0 right-0"
      >
        <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => setView('home')}>
          <div className="w-8 h-8 grid grid-cols-2 gap-0.5">
            <div className="bg-[#00FF88]"></div><div className="bg-white/20"></div>
            <div className="bg-white/20"></div><div className="bg-[#00D1FF]"></div>
          </div>
          <span className="font-display font-bold tracking-[0.3em] text-xl uppercase italic text-white">Cubeverse</span>
        </div>
        
        <nav className="hidden md:flex gap-8 font-sans text-xs font-semibold tracking-widest text-white/50 uppercase pointer-events-auto">
          <button onClick={() => setView('nexus')} className={`flex items-center gap-2 transition-colors duration-300 border-b pb-1 ${view === 'nexus' ? 'text-white border-[#00FF88]' : 'hover:text-white border-transparent hover:border-[#00FF88]'}`}>
            <Sparkles size={14} /> The Nexus
          </button>
          <button onClick={() => setView('library')} className={`flex items-center gap-2 transition-colors duration-300 border-b pb-1 ${view === 'library' ? 'text-white border-[#FF8A00]' : 'hover:text-white border-transparent hover:border-[#FF8A00]'}`}>
            <LibraryIcon size={14} /> Algorithm Forge
          </button>
          <button onClick={() => setView('galaxy')} className={`flex items-center gap-2 transition-colors duration-300 border-b pb-1 ${view === 'galaxy' ? 'text-white border-[#FF00D1]' : 'hover:text-white border-transparent hover:border-[#FF00D1]'}`}>
            <Globe size={14} /> Cubing Galaxy
          </button>
        </nav>

        <div className="hidden md:flex items-center gap-4 pointer-events-auto">
          <ScoreDisplay />
          <div className="glass-panel px-4 py-1.5 rounded-full text-[10px] font-bold tracking-tighter uppercase border-[#00FF88]/40">
            Synchronized <span className="neon-text-g">● Live</span>
          </div>
        </div>
      </motion.header>

      {/* Dynamic Main Content */}
      <AchievementPopup />
      <div className="flex-1 relative w-full h-full pt-16">
        {view === 'home' && <Home onHoverEnter={onHoverEnter} onHoverLeave={onHoverLeave} onBegin={() => setView('nexus')} />}
        {view === 'nexus' && <Nexus solves={solves} setSolves={setSolves} isRunning={isRunning} setIsRunning={setIsRunning} />}
        {view === 'library' && <Library />}
        {view === 'galaxy' && <Galaxy solves={solves} />}
      </div>
    </div>
  );
}
