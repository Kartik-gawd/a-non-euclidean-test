import { useRef } from 'react';
import { DirectionalLight } from 'three';
import { Grid, useHelper } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { DirectionalLightHelper } from 'three';
import { useGameStore } from '../store/gameStore';

export function PrimaryWorld() {
  const debugMode = useGameStore((s) => s.debugMode);

  const dirLightRef = useRef<DirectionalLight>(null!);

  useHelper(
    debugMode ? dirLightRef : null,
    DirectionalLightHelper as any,
    2,
    '#ffff00'
  );

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
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
      />

      <Grid
        position={[0, 0, 0]}
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#3a3a4a"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#5a5a8a"
        fadeDistance={60}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      <RigidBody
        type="fixed"
        position={[0, -0.05, 0]}
        colliders="cuboid"
      >
        <mesh receiveShadow visible={false}>
          <boxGeometry args={[200, 0.1, 200]} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>

      {debugMode && (
        <>
          <RigidBody
            type="fixed"
            position={[4, 0.5, -4]}
            colliders="cuboid"
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color="#c05020"
                roughness={0.7}
              />
            </mesh>
          </RigidBody>

          <RigidBody
            type="fixed"
            position={[-3, 0.5, -6]}
            colliders="cuboid"
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.5, 1, 1.5]} />
              <meshStandardMaterial
                color="#2060c0"
                roughness={0.6}
              />
            </mesh>
          </RigidBody>

          <RigidBody
            type="fixed"
            position={[0, 1, -8]}
            colliders="cuboid"
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2, 2, 0.3]} />
              <meshStandardMaterial
                color="#206040"
                roughness={0.5}
              />
            </mesh>
          </RigidBody>
        </>
      )}
    </>
  );
}
