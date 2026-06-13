import { create } from 'zustand';
import { Vector3 } from 'three';

export interface GameStore {
  isPointerLocked: boolean;
  setPointerLocked: (locked: boolean) => void;

  playerPosition: Vector3;
  setPlayerPosition: (pos: Vector3) => void;

  isGrounded: boolean;
  setGrounded: (grounded: boolean) => void;

  loopCount: number;
  incrementLoopCount: () => void;
  resetLoopCount: () => void;

  anamorphicAlignment: number;
  setAnamorphicAlignment: (v: number) => void;

  debugMode: boolean;
  toggleDebug: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  isPointerLocked: false,
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),

  playerPosition: new Vector3(0, 2, 0),
  setPlayerPosition: (pos) => set({ playerPosition: pos }),

  isGrounded: false,
  setGrounded: (grounded) => set({ isGrounded: grounded }),

  loopCount: 0,
  incrementLoopCount: () => set((s) => ({ loopCount: s.loopCount + 1 })),
  resetLoopCount: () => set({ loopCount: 0 }),

  anamorphicAlignment: 0,
  setAnamorphicAlignment: (v) => set({ anamorphicAlignment: v }),

  debugMode: true,
  toggleDebug: () => set((s) => ({ debugMode: !s.debugMode })),
}));
