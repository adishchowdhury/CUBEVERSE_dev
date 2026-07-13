import { useState } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { MusicPlayer } from './components/MusicPlayer';
import { ShaderBackground } from './components/ShaderBackground';
import { LiquidCursor } from './components/LiquidCursor';

export type ViewState = 'home' | 'nexus' | 'library' | 'galaxy' | 'ai-coach';

export interface Solve {
  id: string;
  timeMs: number;
  date: Date;
  scramble?: string;
}

export default function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [view, setView] = useState<ViewState>('home');
  const [solves, setSolves] = useState<Solve[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="relative w-screen h-screen bg-[#050505] overflow-hidden">
      <ShaderBackground />
      <Scene isHovered={isHovered} isRunning={isRunning} view={view} />
      <Overlay 
        view={view}
        setView={setView}
        solves={solves}
        setSolves={setSolves}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        onHoverEnter={() => setIsHovered(true)} 
        onHoverLeave={() => setIsHovered(false)}
      />
      <MusicPlayer />
      <LiquidCursor />
    </div>
  );
}
