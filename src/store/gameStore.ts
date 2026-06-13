import { create } from 'zustand';
import { Vector3 } from 'three';

export interface PlayerState {
  position: Vector3;
  isGrounded: boolean;
}

export interface GameStore {
  isPointerLocked: boolean;
  setPointerLocked: (locked: boolean) => void;

  playerPosition: Vector3;
  setPlayerPosition: (pos: Vector3) => void;

  isGrounded: boolean;
  setGrounded: (grounded: boolean) => void;

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

  debugMode: true,
  toggleDebug: () => set((s) => ({ debugMode: !s.debugMode })),
}));
