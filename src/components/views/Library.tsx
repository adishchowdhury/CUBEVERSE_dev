import { Cuboid } from 'lucide-react';
import { useCubeStore } from '../../store';

const ALGORITHMS = [
  { id: 't-perm', name: 'T Permutation', category: 'PLL', notation: 'R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'', type: 'Adjacent Corner Swap' },
  { id: 'j-b-perm', name: 'Jb Permutation', category: 'PLL', notation: 'R U R\' F\' R U R\' U\' R\' F R2 U\' R\' U\'', type: 'Adjacent Corner Swap' },
  { id: 'y-perm', name: 'Y Permutation', category: 'PLL', notation: 'F R U\' R\' U\' R U R\' F\' R U R\' U\' R\' F R F\'', type: 'Diagonal Corner Swap' },
  { id: 'h-perm', name: 'H Permutation', category: 'PLL', notation: 'M2 U M2 U2 M2 U M2', type: 'Edge Swap' },
  { id: 'z-perm', name: 'Z Permutation', category: 'PLL', notation: 'M2 U M2 U M\' U2 M2 U2 M\' U2', type: 'Edge Swap' },
  { id: 'sune', name: 'Sune', category: 'OLL', notation: 'R U R\' U R U2 R\'', type: 'All Edges Oriented' },
  { id: 'antisune', name: 'Anti-Sune', category: 'OLL', notation: 'R U2 R\' U\' R U\' R\'', type: 'All Edges Oriented' },
  { id: 'u-a-perm', name: 'Ua Permutation', category: 'PLL', notation: 'R U\' R U R U R U\' R\' U\' R2', type: 'Edge Cycle' },
  { id: 'u-b-perm', name: 'Ub Permutation', category: 'PLL', notation: 'R2 U R U R\' U\' R\' U\' R\' U R\'', type: 'Edge Cycle' },
];

export function Library() {
  const cubeRef = useCubeStore(s => s.cubeRef);
  const addAchievement = useCubeStore(s => s.addAchievement);

  const handlePlayAlgo = (notation: string) => {
    if (cubeRef) {
      cubeRef.reset();
      // add a small delay to let user see reset
      setTimeout(() => {
        cubeRef.playSequence(notation);
        addAchievement('Scholar', 'You reviewed an algorithm from the forge.');
      }, 300);
    }
  };

  return (
    <div className="w-full relative pointer-events-none flex flex-col gap-6 p-4 md:p-8 pb-12">
      <div className="flex justify-between items-end mb-4 pointer-events-auto">
        <div>
          <h2 className="font-display text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            Algorithm <span className="neon-text-g">Forge</span>
          </h2>
          <p className="text-white/40 uppercase tracking-[0.2em] text-xs mt-2">Master the movements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-auto">
        {ALGORITHMS.map(algo => (
          <div 
            key={algo.id} 
            onClick={() => handlePlayAlgo(algo.notation)}
            className="glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-[#00D1FF]/50 transition-colors cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
              <Cuboid size={120} />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/70 uppercase tracking-widest font-bold">
                  {algo.category}
                </span>
                <span className="text-[10px] text-[#00D1FF] uppercase tracking-widest font-semibold">
                  {algo.type}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#00D1FF] transition-colors">{algo.name}</h3>
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-end">
              <p className="font-mono text-sm text-[#00FF88] tracking-wide leading-relaxed font-semibold">{algo.notation}</p>
              <div className="text-[10px] uppercase tracking-widest text-white/20 group-hover:text-[#00D1FF] opacity-0 group-hover:opacity-100 transition-opacity">Play</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
