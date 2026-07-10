import { create } from 'zustand';
import { CubeRef } from './components/Cube';

interface CubeState {
  cubeRef: CubeRef | null;
  setCubeRef: (ref: CubeRef | null) => void;
  achievements: string[];
  addAchievement: (title: string, subtitle: string) => void;
  recentAchievement: { title: string, subtitle: string, id: number } | null;
  score: number;
  addScore: (points: number) => void;
  currentScramble: string;
  setCurrentScramble: (scramble: string) => void;
}

export const useCubeStore = create<CubeState>((set) => ({
  cubeRef: null,
  setCubeRef: (ref) => set({ cubeRef: ref }),
  achievements: [],
  recentAchievement: null,
  addAchievement: (title, subtitle) => set((state) => {
    if (state.achievements.includes(title)) return state;
    return { 
      achievements: [...state.achievements, title],
      recentAchievement: { title, subtitle, id: Date.now() },
      score: state.score + 50 // Bonus points for achievement
    };
  }),
  score: 0,
  addScore: (points) => set((state) => ({ score: Math.max(0, state.score + points) })),
  currentScramble: '',
  setCurrentScramble: (scramble) => set({ currentScramble: scramble }),
}));
