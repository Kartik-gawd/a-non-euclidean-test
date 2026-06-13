import { useRef } from 'react';
import { DirectionalLight } from 'three';
import { Grid, useHelper } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { DirectionalLightHelper } from 'three';
import { useGameStore } from '../store/gameStore';
import { TardisEffect } from '../components/interactables/TardisEffect';
import { LoopHallway } from '../components/interactables/LoopHallway';
import { AnamorphicRoom } from '../components/interactables/AnamorphicRoom';

export function PrimaryWorld() {
  const debugMode = useGameStore((s) => s.debugMode);
  const dirLightRef = useRef<DirectionalLight>(null!);

  useHelper(debugMode ? dirLightRef : null, DirectionalLightHelper as any, 2, '#ffff00');

  return (
    <>
      <ambientLight intensity={0.4} color="#b0c8ff" />

      <directionalLight
        ref={dirLightRef}
        position={[10, 20, 10]}
        intensity={1.8}
        color="#fff8e7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0004}
      />

      <Grid
        position={[0, 0, 0]}
        args={[200, 200]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#3a3a4a"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#5a5a8a"
        fadeDistance={80}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      <RigidBody type="fixed" position={[0, -0.05, 0]} colliders="cuboid">
        <mesh receiveShadow visible={false}>
          <boxGeometry args={[400, 0.1, 400]} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>

      {debugMode && (
        <>
          <RigidBody type="fixed" position={[4, 0.5, -4]} colliders="cuboid">
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#c05020" roughness={0.7} />
            </mesh>
          </RigidBody>
          <RigidBody type="fixed" position={[-3, 0.5, -6]} colliders="cuboid">
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.5, 1, 1.5]} />
              <meshStandardMaterial color="#2060c0" roughness={0.6} />
            </mesh>
          </RigidBody>
        </>
      )}

      <TardisEffect position={[0, 0, -12]} />
      <LoopHallway position={[10, 0, 0]} />
      <AnamorphicRoom position={[-20, 0, 0]} />

      <mesh position={[0, 0.01, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#3a3060" transparent opacity={0.5} emissive="#2a2050" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[10, 0.01, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="#302040" transparent opacity={0.5} emissive="#201030" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-20, 0.01, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color="#201030" transparent opacity={0.5} emissive="#100820" emissiveIntensity={0.3} />
      </mesh>
    </>
  );
}
