import { useRef } from 'react';
import { DirectionalLight, DirectionalLightHelper } from 'three';
import { useHelper, Text } from '@react-three/drei';
import { CuboidCollider } from '@react-three/rapier';
import { RigidBody } from '../core/Dimension';
import { useGameStore } from '../store/gameStore';
import { TardisEffect } from '../components/interactables/TardisEffect';
import { LoopHallway } from '../components/interactables/LoopHallway';
import { Obby } from '../components/interactables/Obby';
import { WeightedCube } from '../components/interactables/WeightedCube';
import { PressurePlate } from '../components/interactables/PressurePlate';

export function PrimaryWorld() {
  const debugMode = useGameStore((s) => s.debugMode);
  const dirLightRef = useRef<DirectionalLight>(null!);

  useHelper(debugMode ? dirLightRef : null, DirectionalLightHelper, 2, '#ffff00');

  return (
    <>
      <ambientLight intensity={0.2} color="#ffffff" />
      <hemisphereLight color="#555555" groundColor="#2a2a30" intensity={0.3} />

      <directionalLight
        ref={dirLightRef}
        position={[20, 30, 20]}
        intensity={1.0}
        color="#e6e6e6"
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

      {/* Solid Colored Floor */}
      <RigidBody type="fixed" position={[0, -1.0, 0]}>
        <CuboidCollider args={[200, 1.0, 200]} />
        <mesh receiveShadow>
          <boxGeometry args={[400, 2.0, 400]} />
          <meshStandardMaterial color="#2d3748" roughness={0.9} />
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
      <Text position={[0, 4, -12]} fontSize={0.8} color="#ffffff" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
        Bigger on the Inside
      </Text>

      <LoopHallway position={[10, 0.01, 0]} />
      <Text position={[10, 4, 0]} fontSize={0.8} color="#ffffff" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000" rotation={[0, -Math.PI / 2, 0]}>
        Infinite Loop Hallway
      </Text>

      <Obby position={[-15, 0, 0]} />
      <Text position={[-15, 4, 0]} fontSize={0.8} color="#ffffff" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000" rotation={[0, Math.PI / 2, 0]}>
        Obstacle Course
      </Text>

      {/* Navigation Breadcrumb Lines (Phase 4) */}
      <mesh position={[0, -0.49, -6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 12]} />
        <meshBasicMaterial color="#88aaff" transparent opacity={0.5} />
      </mesh>
      <mesh position={[5, -0.49, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.2, 10]} />
        <meshBasicMaterial color="#ff8888" transparent opacity={0.5} />
      </mesh>
      <mesh position={[-10, -0.49, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.2, 20]} />
        <meshBasicMaterial color="#aa88ff" transparent opacity={0.5} />
      </mesh>

      {/* Puzzles */}
      <WeightedCube id="cube1" position={[0, 5, 0]} />
      <PressurePlate position={[5, 0, 5]} onActivate={() => console.log('Plate activated!')} />

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
