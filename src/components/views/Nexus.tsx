import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Solve } from '../../App';
import { useCubeStore } from '../../store';
import { 
  db, auth, signIn, 
  collection, query, orderBy, limit, onSnapshot, addDoc 
} from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export function Nexus({ solves, setSolves, isRunning, setIsRunning }: { 
  solves: Solve[], 
  setSolves: React.Dispatch<React.SetStateAction<Solve[]>>,
  isRunning: boolean,
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [globalSolves, setGlobalSolves] = useState<any[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'session' | 'global'>('session');
  
  const currentScramble = useCubeStore(s => s.currentScramble);
  const setCurrentScramble = useCubeStore(s => s.setCurrentScramble);
  
  const cubeRef = useCubeStore(s => s.cubeRef);
  const addAchievement = useCubeStore(s => s.addAchievement);
  
  const reqRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const timerTextRef = useRef<HTMLDivElement>(null);
  const finalTimeRef = useRef<number>(0);
  const frameCounterRef = useRef<number>(0);

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Global solves listener
  useEffect(() => {
    const q = query(collection(db, 'globalSolves'), orderBy('timeMs', 'asc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGlobalSolves(docs);
    });
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Generate initial scramble when Nexus mounts
    if (cubeRef && !currentScramble) {
      cubeRef.reset();
      const s = cubeRef.scramble();
      setCurrentScramble(s);
    }
  }, [cubeRef, currentScramble, setCurrentScramble]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        console.log("Sign-in popup closed by user");
      } else {
        console.error("Sign-in error:", e);
      }
    }
  };

  const saveSolveToFirebase = async (timeMs: number, scramble: string) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'globalSolves'), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Cubeverse Hero',
        timeMs,
        scramble,
        date: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving solve:", e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      if (startTimeRef.current === 0) {
        startTimeRef.current = performance.now();
      }
      
      const update = () => {
        const now = performance.now();
        const elapsed = now - startTimeRef.current;
        finalTimeRef.current = elapsed;
        
        if (timerTextRef.current) {
          timerTextRef.current.innerText = formatTime(elapsed);
        }
        
        // Throttled check for completion to avoid animation lag (matrix traversals on every frame)
        frameCounterRef.current = (frameCounterRef.current || 0) + 1;
        if (frameCounterRef.current >= 15) {
          frameCounterRef.current = 0;
          
          const latestCube = useCubeStore.getState().cubeRef;
          const latestScramble = useCubeStore.getState().currentScramble;
          const solveMovesCount = useCubeStore.getState().solveMovesCount;
          if (elapsed > 500 && solveMovesCount > 0 && latestCube?.isSolved()) {
            const finalElapsed = performance.now() - startTimeRef.current;
            setIsRunning(false);
            const solveData = {
              id: Math.random().toString(),
              timeMs: finalElapsed,
              date: new Date(),
              scramble: latestScramble
            };
            setSolves(prev => [solveData, ...prev]);
            saveSolveToFirebase(finalElapsed, latestScramble);

            latestCube.reset();
            setTimeout(() => {
              useCubeStore.getState().setCurrentScramble(latestCube.scramble());
            }, 1000);
            return;
          }
        }
        
        reqRef.current = requestAnimationFrame(update);
      };
      
      reqRef.current = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(reqRef.current);
      startTimeRef.current = 0; // Reset for next run
      if (timerTextRef.current && !isReady) {
        timerTextRef.current.innerText = formatTime(finalTimeRef.current);
      }
    }
    
    return () => cancelAnimationFrame(reqRef.current);
  }, [isRunning]); // Only depend on isRunning to avoid resets on re-renders

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Timer Logic
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (isRunning) {
          const elapsedTime = performance.now() - startTimeRef.current;
          if (elapsedTime < 10) return;
          
          setIsRunning(false);
          cancelAnimationFrame(reqRef.current);
          finalTimeRef.current = elapsedTime;
          if (timerTextRef.current) timerTextRef.current.innerText = formatTime(elapsedTime);
          
          setSolves(prev => [{ id: Math.random().toString(), timeMs: elapsedTime, date: new Date(), scramble: currentScramble }, ...prev]);
          
          if (cubeRef) {
            cubeRef.reset();
            setTimeout(() => {
              setCurrentScramble(cubeRef.scramble());
            }, 1000);
          }
        } else if (!isReady) {
          setIsReady(true);
          finalTimeRef.current = 0;
          if (timerTextRef.current) timerTextRef.current.innerText = formatTime(0);
        }
      } else if (!isReady) {
        // Cube rotation controls (allowed anytime not holding Spacebar)
        if (!cubeRef) return;
        const key = e.key;
        const moveMap: Record<string, string> = {
          'r': 'R', 'R': "R'",
          'l': 'L', 'L': "L'",
          'u': 'U', 'U': "U'",
          'd': 'D', 'D': "D'",
          'f': 'F', 'F': "F'",
          'b': 'B', 'B': "B'",
          'm': 'M', 'M': "M'",
        };
        if (moveMap[key]) {
          cubeRef.doMove(moveMap[key]);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isReady) {
        e.preventDefault();
        setIsReady(false);
        useCubeStore.getState().resetSolveMovesCount();
        startTimeRef.current = performance.now();
        setIsRunning(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRunning, isReady, setSolves, setIsRunning, cubeRef, currentScramble, setCurrentScramble]);

  // Achievement checks
  useEffect(() => {
    if (solves.length === 1) addAchievement('First Step', 'You completed your first solve.');
    if (solves.length === 10) addAchievement('Dedicated', 'Completed 10 solves in one session.');
    
    if (solves.length > 0) {
      const latest = solves[0];
      if (solves.length > 1) {
        const pb = Math.min(...solves.slice(1).map(s => s.timeMs));
        if (latest.timeMs < pb) {
          addAchievement('New Record', `Beat your previous PB of ${(pb/1000).toFixed(2)}s`);
        }
      }
      
      const timeSec = latest.timeMs / 1000;
      if (timeSec < 600) addAchievement('Sub-10', 'Solved under 10 minutes.');
      if (timeSec < 300) addAchievement('Sub-5', 'Solved under 5 minutes.');
      if (timeSec < 120) addAchievement('Sub-2', 'Solved under 2 minutes.');
      if (timeSec < 60) addAchievement('Sub-1', 'Solved under 1 minute!');
    }
  }, [solves, addAchievement]);

  const formatSolveTime = (ms: number) => {
    const totalSec = ms / 1000;
    return totalSec.toFixed(2);
  };

  const pb = solves.length ? Math.min(...solves.map(s => s.timeMs)) : 0;
  const ao5 = solves.length >= 5 ? solves.slice(0, 5).reduce((a, b) => a + b.timeMs, 0) / 5 : 0;

  return (
    <div className="w-full relative pointer-events-none flex flex-col lg:flex-row items-center lg:items-stretch justify-between p-4 md:p-8 pb-12 gap-8 min-h-[450px]">
      
      {/* Minimalist Bottom Center Timer Area */}
      <div className={`flex-1 flex flex-col items-center pointer-events-none z-20 relative lg:pr-12 py-8 transition-all duration-500 ${isRunning ? 'justify-end min-h-[380px] pb-4 md:pb-8' : 'justify-center min-h-[220px]'}`}>
        {currentScramble && !isRunning && (
          <div className="text-white/40 font-mono text-[10px] md:text-xs uppercase tracking-[0.25em] max-w-md text-center mb-6 leading-relaxed bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm pointer-events-auto">
            <span className="text-white/20 font-bold block mb-1 text-[9px] tracking-[0.3em]">Scramble Sequence</span>
            <span className="text-[#00D1FF] font-medium">{currentScramble}</span>
          </div>
        )}
        <div 
          ref={timerTextRef}
          className={`font-mono font-bold tracking-tighter transition-all duration-500 ${
            isRunning 
              ? 'text-4xl md:text-5xl text-white/30 drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]' 
              : isReady 
                ? 'text-6xl md:text-7xl lg:text-8xl text-[#00FF88] drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]' 
                : 'text-6xl md:text-7xl lg:text-8xl text-white'
          }`}
        >
          {formatTime(finalTimeRef.current)}
        </div>
        
        <AnimatePresence>
          {!isRunning && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="text-white/40 uppercase tracking-[0.3em] text-[10px] md:text-[11px] mt-6 font-semibold text-center"
            >
              Hold Spacebar to Ready
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint Button when running */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 pointer-events-auto"
            >
              <button 
                onClick={() => {
                  useCubeStore.getState().addScore(-5);
                  addAchievement('Needed Help', 'Used a hint during a solve.');
                }}
                className="px-6 py-3 bg-[#FF00D1]/20 hover:bg-[#FF00D1]/40 border border-[#FF00D1]/50 rounded-full text-white font-bold tracking-widest uppercase text-xs transition-colors backdrop-blur-md flex items-center gap-2 cursor-pointer"
              >
                <span>Hint / Assist</span>
                <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded">-5 pts</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Right sidebar: Recent Solves & Leaderboard */}
      <div className={`w-full lg:w-80 max-h-[480px] lg:max-h-[550px] glass-panel rounded-2xl p-6 flex flex-col pointer-events-auto transition-all duration-700 ${isRunning ? 'opacity-0 translate-y-10 lg:translate-x-10 pointer-events-none' : 'opacity-100 translate-y-0 lg:translate-x-0'}`}>
        
        <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
          <button 
            onClick={() => setSidebarTab('session')}
            className={`text-[10px] uppercase tracking-[0.2em] transition-colors ${sidebarTab === 'session' ? 'text-white font-bold' : 'text-white/40 hover:text-white/60'} cursor-pointer`}
          >
            Session
          </button>
          <button 
            onClick={() => setSidebarTab('global')}
            className={`text-[10px] uppercase tracking-[0.2em] transition-colors ${sidebarTab === 'global' ? 'text-white font-bold' : 'text-white/40 hover:text-white/60'} cursor-pointer`}
          >
            Global
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide min-h-[150px]">
          {sidebarTab === 'session' ? (
            <>
              {solves.map((solve, i) => (
                <div key={solve.id} className="flex flex-col bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/40 text-xs font-mono">#{solves.length - i}</span>
                    <span className="text-white font-mono font-bold text-lg">{formatSolveTime(solve.timeMs)}</span>
                  </div>
                  <span className="text-[8px] font-mono text-white/20 tracking-widest truncate">{solve.scramble}</span>
                </div>
              ))}
              {solves.length === 0 && (
                <div className="text-white/30 text-xs uppercase tracking-widest text-center mt-10">No local solves</div>
              )}
            </>
          ) : (
            <>
              {globalSolves.map((solve, i) => (
                <div key={solve.id} className="flex flex-col bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col">
                      <span className="text-white/40 text-[8px] font-mono uppercase">#{i + 1} {solve.userName}</span>
                      <span className="text-white font-mono font-bold text-lg">{formatSolveTime(solve.timeMs)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {globalSolves.length === 0 && (
                <div className="text-white/30 text-xs uppercase tracking-widest text-center mt-10">No global records</div>
              )}
            </>
          )}
        </div>
        
        {sidebarTab === 'session' && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">PB</div>
              <div className="text-[#00FF88] font-mono font-bold text-xl">{pb ? formatSolveTime(pb) : '--'}</div>
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">AO5</div>
              <div className="text-white font-mono font-bold text-xl">{ao5 ? formatSolveTime(ao5) : '--'}</div>
            </div>
          </div>
        )}

        {!user && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={handleSignIn}
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold tracking-widest uppercase text-[10px] transition-colors cursor-pointer"
            >
              Sign in for Global Stats
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
