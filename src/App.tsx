import { useState } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { Chatbot } from './components/Chatbot';
import { MusicPlayer } from './components/MusicPlayer';

export type ViewState = 'home' | 'nexus' | 'library' | 'galaxy';

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
      <Chatbot />
      <MusicPlayer />
    </div>
  );
}
