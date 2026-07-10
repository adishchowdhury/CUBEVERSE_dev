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
        
        // Check for completion
        const latestCube = useCubeStore.getState().cubeRef;
        const latestScramble = useCubeStore.getState().currentScramble;
        if (elapsed > 500 && latestCube?.isSolved()) {
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
          if (elapsedTime < 500) return;
          
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
          if (cubeRef) cubeRef.reset(); // snap to ready
        }
      } else if (!isRunning && !isReady) {
        // Cube rotation controls (if not solving)
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
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-6 md:p-12 lg:p-16 z-10 pointer-events-none relative">
      
      {/* Current Scramble Display */}
      <AnimatePresence>
        {!isRunning && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="absolute top-10 left-1/2 -translate-x-1/2 text-center max-w-lg z-20 pointer-events-none"
          >
            <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Current Scramble</div>
            <div className="font-mono text-[#00D1FF] text-lg font-bold tracking-widest">{currentScramble || 'Generating...'}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimalist Bottom Center Timer */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
        <div 
          ref={timerTextRef}
          className={`font-mono text-5xl md:text-6xl font-bold tracking-tighter transition-colors duration-300 ${isReady ? 'text-[#00FF88] drop-shadow-[0_0_15px_rgba(0,255,136,0.5)]' : 'text-white'}`}
        >
          {formatTime(finalTimeRef.current)}
        </div>
        
        <AnimatePresence>
          {!isRunning && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="text-white/40 uppercase tracking-[0.3em] text-[10px] mt-4 font-semibold text-center"
            >
              Hold Spacebar to Ready
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hint Button when running */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-10 bottom-10 z-20 pointer-events-auto"
          >
            <button 
              onClick={() => {
                useCubeStore.getState().addScore(-5);
                addAchievement('Needed Help', 'Used a hint during a solve.');
              }}
              className="px-6 py-3 bg-[#FF00D1]/20 hover:bg-[#FF00D1]/40 border border-[#FF00D1]/50 rounded-full text-white font-bold tracking-widest uppercase text-xs transition-colors backdrop-blur-md flex items-center gap-2"
            >
              <span>Hint / Assist</span>
              <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded">-5 pts</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Right sidebar: Recent Solves & Leaderboard */}
      <div className={`w-full md:w-80 h-[80%] glass-panel rounded-2xl p-6 flex flex-col mt-4 md:mt-0 transition-all duration-700 absolute right-6 md:right-12 lg:right-16 top-1/2 -translate-y-1/2 pointer-events-auto ${isRunning ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
        
        <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
          <button 
            onClick={() => setSidebarTab('session')}
            className={`text-[10px] uppercase tracking-[0.2em] transition-colors ${sidebarTab === 'session' ? 'text-white font-bold' : 'text-white/40 hover:text-white/60'}`}
          >
            Session
          </button>
          <button 
            onClick={() => setSidebarTab('global')}
            className={`text-[10px] uppercase tracking-[0.2em] transition-colors ${sidebarTab === 'global' ? 'text-white font-bold' : 'text-white/40 hover:text-white/60'}`}
          >
            Global
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
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

        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          {!user && (
            <button
              onClick={handleSignIn}
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold tracking-widest uppercase text-[10px] transition-colors"
            >
              Sign in for Global Stats
            </button>
          )}
          
          <button
            onClick={async () => {
              const btn = document.getElementById('coach-btn');
              if (btn) btn.innerText = 'Thinking...';
              try {
                const historyText = solves.slice(0, 5).map(s => (s.timeMs / 1000).toFixed(2) + "s").join(", ");
                const prompt = `You are a supportive speedcubing coach. The user's last 5 solves are: ${historyText || 'none yet'}. Give a single short sentence of advice or encouragement.`;
                
                const chatRes = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });
                const { text } = await chatRes.json();
                
                if (btn) btn.innerText = 'Speaking...';
                const ttsRes = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                
                const blob = await ttsRes.blob();
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.onended = () => { if (btn) btn.innerText = 'AI Coach'; };
                audio.play();
              } catch (e) {
                console.error(e);
                if (btn) btn.innerText = 'AI Coach';
              }
            }}
            id="coach-btn"
            className="w-full py-3 bg-[#00D1FF]/20 hover:bg-[#00D1FF]/40 border border-[#00D1FF]/50 rounded-lg text-[#00D1FF] font-bold tracking-widest uppercase text-xs transition-colors backdrop-blur-md"
          >
            AI Coach
          </button>
        </div>
      </div>
    </div>
  );
}
