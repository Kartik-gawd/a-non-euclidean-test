import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

export function GhostRenderer({ dimension }: { dimension: number }) {
  // We don't subscribe to the array changes reactively to avoid re-renders!
  // Instead, we just read the store in useFrame and update a bunch of instanced meshes or standard meshes!
  
  const groupRef = React.useRef<Group>(null);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    const ghosts = useGameStore.getState().ghosts.filter(g => g.dim === dimension);
    
    // Simple naive sync for a small number of ghosts
    // In a real game we'd use InstancedMesh
    groupRef.current.children.forEach((child, i) => {
      if (i < ghosts.length) {
        child.visible = true;
        child.position.copy(ghosts[i].pos);
        child.quaternion.copy(ghosts[i].rot);
      } else {
        child.visible = false;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Pre-allocate a few ghost meshes */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} visible={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#88aaff" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
