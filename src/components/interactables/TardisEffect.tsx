import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshPortalMaterial, RoundedBox, Text } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh, Color } from 'three';
import { useGameStore } from '../store/gameStore';

function CastleInterior() {
  return (
    <>
      <ambientLight intensity={0.3} color="#4433aa" />
      <pointLight position={[0, 8, 0]} intensity={3} color="#aa8833" distance={30} />
      <pointLight position={[10, 4, 10]} intensity={1.5} color="#3388aa" distance={20} />
      <pointLight position={[-10, 4, -10]} intensity={1.5} color="#aa3355" distance={20} />

      <mesh position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1a1225" roughness={0.9} />
      </mesh>

      <mesh position={[0, 20, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0d0a18" side={2} />
      </mesh>

      {[-28, -14, 0, 14, 28].map((x) =>
        [-28, -14, 0, 14, 28].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0, z]} castShadow>
            <cylinderGeometry args={[0.3, 0.35, 8, 8]} />
            <meshStandardMaterial color="#2a2035" roughness={0.8} />
          </mesh>
        ))
      )}

      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, i * 4 + 1, -25]}>
          <mesh>
            <boxGeometry args={[4, 3, 0.3]} />
            <meshStandardMaterial color="#1a0f05" roughness={0.9} />
          </mesh>
          <pointLight position={[0, 0, 1]} intensity={0.8} color="#ff9933" distance={5} />
        </group>
      ))}

      <mesh position={[0, 0.01, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#3a2a55" roughness={0.4} metalness={0.1} />
      </mesh>

      <Text
        position={[0, 12, -27]}
        fontSize={1.5}
        color="#ccaa44"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        THE GREAT HALL
      </Text>
    </>
  );
}

function BoothExterior() {
  const color = '#1a3a8a';
  return (
    <>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1.4, 3, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      <mesh position={[0, 3.15, 0]}>
        <boxGeometry args={[1.6, 0.3, 1.6]} />
        <meshStandardMaterial color="#152d6e" roughness={0.5} />
      </mesh>

      <mesh position={[0, 3.45, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color="#d4aa30" metalness={0.8} roughness={0.2} emissive="#d4aa30" emissiveIntensity={0.4} />
      </mesh>

      {[[-0.6, 1.5], [0.6, 1.5]].map(([x, y], i) =>
        [[-0.6, 0.5], [0.6, 0.5]].map(([z, _], j) => (
          <mesh key={`${i}-${j}`} position={[x * 0.6, y, z * 0.6]}>
            <boxGeometry args={[0.02, 2.8, 0.02]} />
            <meshStandardMaterial color="#d4aa30" metalness={0.9} roughness={0.1} />
          </mesh>
        ))
      )}

      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[1.45, 0.05, 1.45]} />
        <meshStandardMaterial color="#d4aa30" metalness={0.6} roughness={0.3} emissive="#d4aa30" emissiveIntensity={0.2} />
      </mesh>
    </>
  );
}

export function TardisEffect({ position = [0, 0, -12] as [number, number, number] }) {
  const doorRef = useRef<Mesh>(null);

  return (
    <group position={position}>
      <BoothExterior />

      <mesh ref={doorRef} position={[0, 1.5, 0.71]}>
        <planeGeometry args={[1.0, 2.8]} />
        <MeshPortalMaterial side={2} worldUnits blur={0.05}>
          <CastleInterior />
        </MeshPortalMaterial>
      </mesh>

      <RigidBody type="fixed" position={[0, 1.5, 0]}>
        <CuboidCollider args={[0.7, 1.5, 0.7]} />
      </RigidBody>

      <pointLight position={[0, 3.5, 0]} intensity={0.5} color="#8866ff" distance={3} />
    </group>
  );
}
