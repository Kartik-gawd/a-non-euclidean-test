import React from 'react';
import { Physics } from '@react-three/rapier';
import { useGameStore } from '../store/gameStore';

interface PhysicsWorldProps {
  children: React.ReactNode;
}

export function PhysicsWorld({ children }: PhysicsWorldProps) {
  const debugMode = useGameStore((s) => s.debugMode);

  return (
    <Physics
      gravity={[0, -9.81, 0]}
      debug={debugMode}
      colliders={false}
    >
      {children}
    </Physics>
  );
}
