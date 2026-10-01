import { create } from 'zustand';
import { Vector3, Quaternion, Euler } from 'three';

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

  canGrab: boolean;
  setCanGrab: (v: boolean) => void;

  debugMode: boolean;
  toggleDebug: () => void;

  teleportRequest: { pos: Vector3; rotDelta: import('three').Quaternion; time: number } | null;
  requestTeleport: (pos: Vector3, rotDelta: import('three').Quaternion) => void;

  cameraEuler: { yaw: number; pitch: number };
  setCameraEuler: (yaw: number, pitch: number) => void;

  gravityDirection: Vector3;
  setGravityDirection: (dir: Vector3) => void;

  currentDimension: number;
  setCurrentDimension: (dim: number) => void;

  heldObject: any | null;
  setHeldObject: (obj: any | null) => void;

  ghosts: { id: string; pos: import('three').Vector3; rot: import('three').Quaternion; dim: number; size?: [number, number, number] }[];
  setGhost: (id: string, ghostData: any) => void;
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

  canGrab: false,
  setCanGrab: (v) => set({ canGrab: v }),

  debugMode: false,
  toggleDebug: () => set((s) => ({ debugMode: !s.debugMode })),

  teleportRequest: null,
  requestTeleport: (pos, rotDelta) => set((state) => {
    console.log("TELEPORT REQUESTED!", pos, new Error().stack);
    const dummyQuat = new Quaternion().setFromEuler(
      new Euler(state.cameraEuler.pitch, state.cameraEuler.yaw, 0, 'YXZ')
    );
    dummyQuat.premultiply(rotDelta);
    const newEuler = new Euler().setFromQuaternion(dummyQuat, 'YXZ');
    
    return {
      teleportRequest: { pos, rotDelta, time: performance.now() },
      cameraEuler: { yaw: newEuler.y, pitch: newEuler.x }
    };
  }),

  cameraEuler: { yaw: 0, pitch: 0 },
  setCameraEuler: (yaw, pitch) => set({ cameraEuler: { yaw, pitch } }),

  gravityDirection: new Vector3(0, -1, 0),
  setGravityDirection: (dir) => set({ gravityDirection: dir.clone().normalize() }),

  currentDimension: 0,
  setCurrentDimension: (dim) => set({ currentDimension: dim }),

  heldObject: null,
  setHeldObject: (obj) => set({ heldObject: obj }),

  ghosts: [],
  setGhost: (id, ghostData) => set((state) => {
    if (!ghostData) {
      return { ghosts: state.ghosts.filter((g) => g.id !== id) };
    }
    const existing = state.ghosts.find((g) => g.id === id);
    if (existing) {
      existing.pos = ghostData.pos;
      existing.rot = ghostData.rot;
      existing.dim = ghostData.dim;
      return { ghosts: [...state.ghosts] };
    }
    return { ghosts: [...state.ghosts, { id, ...ghostData }] };
  }),
}));
