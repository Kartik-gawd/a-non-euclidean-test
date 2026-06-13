import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { MeshPortalMaterial } from '@react-three/drei';
import { Color, Mesh, Vector3 } from 'three';
import { useGameStore } from '../store/gameStore';

const HALLWAY_LENGTH = 20;
const HALLWAY_WIDTH = 3;
const HALLWAY_HEIGHT = 3;

const LOOP_MUTATIONS: Array<{ wallColor: string; floorColor: string; lightColor: string; lightIntensity: number }> = [
  { wallColor: '#1a1a2e', floorColor: '#16213e', lightColor: '#4488ff', lightIntensity: 0.8 },
  { wallColor: '#2e1a1a', floorColor: '#3e1616', lightColor: '#ff4444', lightIntensity: 0.9 },
  { wallColor: '#1a2e1a', floorColor: '#163e16', lightColor: '#44ff88', lightIntensity: 0.7 },
  { wallColor: '#2e2a1a', floorColor: '#3e3216', lightColor: '#ffaa33', lightIntensity: 1.0 },
  { wallColor: '#2a1a2e', floorColor: '#2d163e', lightColor: '#aa44ff', lightIntensity: 0.85 },
];

interface HallwaySegmentProps {
  mutation: typeof LOOP_MUTATIONS[0];
  loopCount: number;
}

function HallwaySegment({ mutation, loopCount }: HallwaySegmentProps) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 2.5, -5]} intensity={mutation.lightIntensity * 2} color={mutation.lightColor} distance={12} />
      <pointLight position={[0, 2.5, -15]} intensity={mutation.lightIntensity * 2} color={mutation.lightColor} distance={12} />

      <mesh position={[0, HALLWAY_HEIGHT / 2, -HALLWAY_LENGTH / 2]} receiveShadow>
        <boxGeometry args={[HALLWAY_WIDTH, HALLWAY_HEIGHT, HALLWAY_LENGTH]} />
        <meshStandardMaterial color={mutation.wallColor} side={1} roughness={0.9} />
      </mesh>

      <mesh position={[0, 0, -HALLWAY_LENGTH / 2]} receiveShadow>
        <planeGeometry args={[HALLWAY_WIDTH - 0.01, HALLWAY_LENGTH]} />
        <meshStandardMaterial color={mutation.floorColor} roughness={0.8} metalness={0.1} />
      </mesh>

      <mesh position={[0, HALLWAY_HEIGHT - 0.01, -HALLWAY_LENGTH / 2]}>
        <planeGeometry args={[HALLWAY_WIDTH - 0.01, HALLWAY_LENGTH]} />
        <meshStandardMaterial color={mutation.wallColor} roughness={0.9} side={1} />
      </mesh>

      {[3, 7, 13, 17].map((z) => (
        <group key={z} position={[0, 2, -z]}>
          <mesh>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial
              color={mutation.lightColor}
              emissive={mutation.lightColor}
              emissiveIntensity={1}
            />
          </mesh>
          <pointLight intensity={0.3} color={mutation.lightColor} distance={3} />
        </group>
      ))}

      <mesh position={[-HALLWAY_WIDTH / 2 + 0.3, 1, -HALLWAY_LENGTH * 0.6]}>
        <boxGeometry args={[0.1, 0.3, 0.05]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      <mesh position={[HALLWAY_WIDTH / 2 - 0.4, 0.5, -HALLWAY_LENGTH * 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={mutation.lightColor} emissive={mutation.lightColor} emissiveIntensity={2} />
      </mesh>
    </>
  );
}

interface LoopHallwayProps {
  position?: [number, number, number];
}

export function LoopHallway({ position = [8, 0, 0] }: LoopHallwayProps) {
  const [loopCount, setLoopCount] = useState(0);
  const mutation = LOOP_MUTATIONS[loopCount % LOOP_MUTATIONS.length];
  const nextMutation = LOOP_MUTATIONS[(loopCount + 1) % LOOP_MUTATIONS.length];

  const { camera } = useThree();
  const teleportCooldownRef = useRef(false);

  const handleEndReached = useCallback(() => {
    if (teleportCooldownRef.current) return;
    teleportCooldownRef.current = true;

    const worldPos = camera.position.clone();
    camera.position.set(
      position[0],
      position[1] + 1.6,
      position[2] + 1.0
    );

    setLoopCount((c) => c + 1);
    setTimeout(() => { teleportCooldownRef.current = false; }, 600);
  }, [camera, position]);

  return (
    <group position={position}>
      <mesh position={[0, HALLWAY_HEIGHT / 2, -0.5]}>
        <planeGeometry args={[HALLWAY_WIDTH, HALLWAY_HEIGHT]} />
        <MeshPortalMaterial side={2} worldUnits blur={0.0}>
          <HallwaySegment mutation={mutation} loopCount={loopCount} />

          <mesh position={[0, HALLWAY_HEIGHT / 2, -HALLWAY_LENGTH + 0.5]}>
            <planeGeometry args={[HALLWAY_WIDTH, HALLWAY_HEIGHT]} />
            <MeshPortalMaterial side={2} worldUnits blur={0.0}>
              <HallwaySegment mutation={nextMutation} loopCount={loopCount + 1} />
            </MeshPortalMaterial>
          </mesh>
        </MeshPortalMaterial>
      </mesh>

      <RigidBody type="fixed" position={[0, HALLWAY_HEIGHT / 2, -HALLWAY_LENGTH + 0.3]} sensor
        onIntersectionEnter={handleEndReached}>
        <CuboidCollider args={[HALLWAY_WIDTH / 2, HALLWAY_HEIGHT / 2, 0.1]} />
      </RigidBody>

      <RigidBody type="fixed" position={[0, HALLWAY_HEIGHT / 2, -0.01]}>
        <CuboidCollider args={[HALLWAY_WIDTH / 2, HALLWAY_HEIGHT / 2, 0.05]} />
      </RigidBody>

      <RigidBody type="fixed" position={[-HALLWAY_WIDTH / 2, HALLWAY_HEIGHT / 2, -HALLWAY_LENGTH / 2]}>
        <CuboidCollider args={[0.1, HALLWAY_HEIGHT / 2, HALLWAY_LENGTH / 2]} />
      </RigidBody>
      <RigidBody type="fixed" position={[HALLWAY_WIDTH / 2, HALLWAY_HEIGHT / 2, -HALLWAY_LENGTH / 2]}>
        <CuboidCollider args={[0.1, HALLWAY_HEIGHT / 2, HALLWAY_LENGTH / 2]} />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 0, -HALLWAY_LENGTH / 2]}>
        <CuboidCollider args={[HALLWAY_WIDTH / 2, 0.1, HALLWAY_LENGTH / 2]} />
      </RigidBody>
    </group>
  );
}
