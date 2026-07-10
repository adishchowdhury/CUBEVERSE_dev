import { motion } from 'motion/react';

export function Home({ onHoverEnter, onHoverLeave, onBegin }: { onHoverEnter: () => void, onHoverLeave: () => void, onBegin: () => void }) {
  return (
    <>
      <main className="flex-1 h-full flex p-6 md:p-12 lg:p-16 relative z-10 items-center justify-center md:justify-start">
        <div className="max-w-3xl pointer-events-auto">
          <motion.h1 
            initial={{ opacity: 0, filter: 'blur(12px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="font-display text-5xl md:text-7xl lg:text-[7rem] font-black italic tracking-tighter leading-[0.9] uppercase text-white"
          >
            The Most <br/>
            <span className="neon-text-g pr-4">Beautiful</span> <br/>
            Solve.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="mt-8 text-sm tracking-[0.2em] md:text-base md:tracking-[0.3em] max-w-lg leading-relaxed font-mono font-bold italic text-right text-white"
          >
            Enter a digital monument dedicated to the passion of speedcubing. Analyze your lookahead, track your galaxy of algorithms, and master the art.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
          >
            <button 
              onMouseEnter={onHoverEnter}
              onMouseLeave={onHoverLeave}
              onClick={onBegin}
              className="group relative px-10 py-4 bg-transparent text-[#00FF88] font-sans font-bold uppercase tracking-widest text-xs overflow-hidden rounded-full border border-[#00FF88]/50 hover:bg-[#00FF88]/10 transition-all duration-300 w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-[#00FF88]/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
              <span className="relative z-10">Begin Experience</span>
            </button>
            <button className="px-10 py-4 border border-white/20 text-white font-sans font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors duration-500 rounded-full w-full sm:w-auto">
              Explore Demo
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer is only visible on the home view */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-0 left-0 right-0 h-20 glass-panel border-t-0 border-white/10 mx-6 mb-6 rounded-2xl flex items-center px-8 justify-between z-20 pointer-events-auto"
      >
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[10px] text-white/30 uppercase tracking-[0.2em]">001 // INITIALIZATION</span>
            <span className="font-sans text-[10px] text-[#00D1FF] uppercase tracking-[0.2em] font-bold">LAT 34.0522 N / LON 118.2437 W</span>
          </div>
          <div className="hidden md:block w-[1px] h-8 bg-white/10"></div>
          <div className="hidden md:flex flex-col gap-1">
             <span className="font-sans text-[10px] uppercase text-white/30 tracking-[0.2em]">Active Model</span>
             <span className="font-sans text-[10px] text-white uppercase tracking-[0.2em] font-bold">Cubeverse Engine Built by Adrija Chowdhury v4.0</span>
          </div>
        </div>
      </motion.footer>
    </>
  );
}
