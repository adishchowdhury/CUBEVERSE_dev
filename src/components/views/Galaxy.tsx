import { Solve } from '../../App';
import { motion } from 'motion/react';
import { useCubeStore } from '../../store';
import { GlobalAnalytics } from '../GlobalAnalytics';

export function Galaxy({ solves }: { solves: Solve[] }) {
  const achievements = useCubeStore(s => s.achievements);

  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none p-12 overflow-hidden">
      <div className="w-full max-w-5xl h-[80%] glass-panel rounded-3xl p-10 flex flex-col relative overflow-hidden pointer-events-auto">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF00D1]/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <h2 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-2 z-10">Cubing Galaxy</h2>
        <p className="text-white/50 text-sm tracking-wider mb-8 z-10">Your journey through space and time.</p>

        <div className="flex-1 flex gap-8 z-10">
          <div className="flex-1 glass-panel rounded-2xl p-6 bg-white/5 overflow-y-auto">
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Constellation of Solves</h3>
            {solves.length === 0 ? (
              <div className="text-white/20 text-center mt-20 uppercase tracking-widest text-xs">The void is empty.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {solves.map((solve, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={solve.id} 
                    className="p-4 rounded-xl border border-white/10 bg-black/20 flex flex-col items-center justify-center relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00D1FF]/10 to-[#FF00D1]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-xs text-white/40 mb-1">#{solves.length - i}</span>
                    <span className="text-xl font-bold font-mono text-[#00FF88]">{(solve.timeMs / 1000).toFixed(2)}s</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="w-1/3 flex flex-col gap-6 h-full">
            <div className="glass-panel rounded-2xl p-6 bg-white/5 flex-1 overflow-y-auto scrollbar-hide">
              <h3 className="text-[10px] uppercase tracking-widest text-[#FF00D1] font-bold mb-4 sticky top-0 bg-transparent backdrop-blur-sm pb-2">Achievements</h3>
              {achievements.length === 0 ? (
                <div className="text-white/20 text-center mt-10 uppercase tracking-widest text-xs">No achievements yet.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {achievements.map((ach, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[#FF00D1]/30 bg-[#FF00D1]/5"
                    >
                      <span className="text-xl">🏆</span>
                      <span className="text-sm font-bold text-white">{ach}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel rounded-2xl p-6 bg-white/5">
              <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Stats</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-white/50">Total Solves</span>
                <span className="font-mono text-xl font-bold text-white">{solves.length}</span>
              </div>
            </div>
          </div>
        </div>

        <GlobalAnalytics />
      </div>
    </div>
  );
}
