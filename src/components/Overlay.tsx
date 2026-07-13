import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Library as LibraryIcon, Globe, Bot } from 'lucide-react';
import { Home } from './views/Home';
import { Nexus } from './views/Nexus';
import { Library } from './views/Library';
import { Galaxy } from './views/Galaxy';
import { AICoach } from './views/AICoach';
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
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] glass-panel-apple px-6 py-4 flex items-center gap-4 pointer-events-none liquid-transition"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
            🏆
          </div>
          <div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Achievement Unlocked</div>
            <div className="text-white font-medium calligraphy">{recentAchievement.title}</div>
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
    <div className="flex items-center gap-2 glass-panel-apple px-4 py-1.5 liquid-transition">
      <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">Score</span>
      <span className="font-mono text-sm text-white font-bold">{score}</span>
    </div>
  );
}

export function Overlay({ 
  view, setView, solves, setSolves, isRunning, setIsRunning, onHoverEnter, onHoverLeave 
}: { 
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
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="h-16 flex items-center justify-between px-4 md:px-10 z-20 absolute top-4 left-4 right-4 glass-panel-apple liquid-transition"
      >
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto cursor-pointer" onClick={() => setView('home')}>
          <div className="w-6 h-6 md:w-8 md:h-8 grid grid-cols-2 gap-0.5">
            <div className="bg-white/80 rounded-sm"></div><div className="bg-white/20 rounded-sm"></div>
            <div className="bg-white/20 rounded-sm"></div><div className="bg-white/80 rounded-sm"></div>
          </div>
          <span className="font-calligraphy calligraphy text-lg md:text-2xl font-medium tracking-normal text-white">Cubeverse</span>
        </div>
        
        <nav className="flex gap-1 md:gap-2.5 font-sans text-[8px] md:text-[10px] font-bold tracking-wider md:tracking-widest text-white/50 uppercase pointer-events-auto items-center overflow-x-auto scrollbar-hide py-1 flex-1 md:flex-initial justify-center md:justify-start max-w-[70%] sm:max-w-none">
          <button 
            onClick={() => setView('nexus')} 
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 rounded-full transition-all duration-500 liquid-transition whitespace-nowrap ${
              view === 'nexus' 
                ? 'text-white bg-white/10 btn-shimmer border border-white/15' 
                : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Sparkles size={11} className="md:w-[13px] md:h-[13px]" />
            <span><span className="hidden sm:inline">The </span>Nexus</span>
          </button>
          <button 
            onClick={() => setView('library')} 
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 rounded-full transition-all duration-500 liquid-transition whitespace-nowrap ${
              view === 'library' 
                ? 'text-white bg-white/10 btn-shimmer border border-white/15' 
                : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <LibraryIcon size={11} className="md:w-[13px] md:h-[13px]" />
            <span><span className="hidden sm:inline">Algo </span>Forge</span>
          </button>
          <button 
            onClick={() => setView('galaxy')} 
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 rounded-full transition-all duration-500 liquid-transition whitespace-nowrap ${
              view === 'galaxy' 
                ? 'text-white bg-white/10 btn-shimmer border border-white/15' 
                : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Globe size={11} className="md:w-[13px] md:h-[13px]" />
            <span><span className="hidden sm:inline">Cubing </span>Galaxy</span>
          </button>
          <button 
            onClick={() => setView('ai-coach')} 
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 rounded-full transition-all duration-500 liquid-transition whitespace-nowrap ${
              view === 'ai-coach' 
                ? 'text-white bg-white/10 btn-shimmer border border-white/15' 
                : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Bot size={11} className="md:w-[13px] md:h-[13px]" />
            <span>AI Coach</span>
          </button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
          <ScoreDisplay />
          <div className="hidden sm:block glass-panel-apple px-3 py-1.5 text-[9px] font-bold tracking-tighter uppercase liquid-transition text-white/80">
            Live
          </div>
        </div>
      </motion.header>

      {/* Dynamic Main Content */}
      <AchievementPopup />
      <div className="flex-1 w-full overflow-y-auto scrollbar-hide pointer-events-none pt-24 pb-6 flex flex-col">
        {view === 'home' && <Home onHoverEnter={onHoverEnter} onHoverLeave={onHoverLeave} onBegin={() => setView('nexus')} />}
        {view === 'nexus' && <Nexus solves={solves} setSolves={setSolves} isRunning={isRunning} setIsRunning={setIsRunning} />}
        {view === 'library' && <Library />}
        {view === 'galaxy' && <Galaxy solves={solves} />}
        {view === 'ai-coach' && <AICoach />}
      </div>
    </div>
  );
}
