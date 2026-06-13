import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh, Vector3, Color, MeshStandardMaterial } from 'three';

const SWEET_SPOT = new Vector3(0, 1.6, 6);
const ALIGNMENT_RADIUS = 1.2;

interface StepData {
  alignedPos: [number, number, number];
  alignedRot: [number, number, number];
  size: [number, number, number];
  color: string;
  chaosOffset: [number, number, number];
  chaosRotation: [number, number, number];
}

const STEPS: StepData[] = [
  {
    alignedPos: [-2.0, 0.25, -2],
    alignedRot: [0, 0, 0],
    size: [2, 0.5, 1.2],
    color: '#8844cc',
    chaosOffset: [3.2, 1.8, -1.5],
    chaosRotation: [0.4, 1.1, 0.3],
  },
  {
    alignedPos: [-1.0, 0.75, -2],
    alignedRot: [0, 0, 0],
    size: [2, 0.5, 1.2],
    color: '#6633aa',
    chaosOffset: [-2.5, 0.3, 2.2],
    chaosRotation: [-0.6, 0.8, 1.2],
  },
  {
    alignedPos: [0.0, 1.25, -2],
    alignedRot: [0, 0, 0],
    size: [2, 0.5, 1.2],
    color: '#5522aa',
    chaosOffset: [1.8, -0.9, -2.8],
    chaosRotation: [1.1, -0.5, 0.7],
  },
  {
    alignedPos: [1.0, 1.75, -2],
    alignedRot: [0, 0, 0],
    size: [2, 0.5, 1.2],
    color: '#4411aa',
    chaosOffset: [-3.1, 2.4, 1.4],
    chaosRotation: [0.2, 1.4, -0.9],
  },
  {
    alignedPos: [2.0, 2.25, -2],
    alignedRot: [0, 0, 0],
    size: [2, 0.5, 1.2],
    color: '#3300aa',
    chaosOffset: [2.4, 0.6, 3.0],
    chaosRotation: [-0.8, -1.2, 0.4],
  },
  {
    alignedPos: [-2.5, 0.5, 0],
    alignedRot: [0, 0.2, 0],
    size: [0.8, 1.0, 0.8],
    color: '#cc4488',
    chaosOffset: [0.5, 2.8, -0.8],
    chaosRotation: [0.9, 0.3, -1.1],
  },
  {
    alignedPos: [2.5, 1.5, -1],
    alignedRot: [0, -0.3, 0],
    size: [0.6, 2.0, 0.6],
    color: '#aa2266',
    chaosOffset: [-1.8, -1.2, 2.6],
    chaosRotation: [-0.3, 0.7, 1.3],
  },
  {
    alignedPos: [0, 3.0, -3],
    alignedRot: [0.1, 0, 0],
    size: [4, 0.3, 0.5],
    color: '#2244cc',
    chaosOffset: [0.9, 3.5, -2.1],
    chaosRotation: [0.5, -0.9, 0.6],
  },
];

interface FloatingBlockProps {
  step: StepData;
  alignment: number;
}

function FloatingBlock({ step, alignment }: FloatingBlockProps) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);

  const targetPos = useMemo(() => new Vector3(
    step.alignedPos[0] + step.chaosOffset[0],
    step.alignedPos[1] + step.chaosOffset[1],
    step.alignedPos[2] + step.chaosOffset[2]
  ), [step]);

  const alignedVec = useMemo(() => new Vector3(...step.alignedPos), [step]);

  useFrame((_, delta) => {
    if (!meshRef.current || !matRef.current) return;

    const lerpSpeed = delta * 3;
    meshRef.current.position.lerp(alignment > 0.7 ? alignedVec : targetPos, lerpSpeed);

    const targetRx = alignment > 0.7
      ? step.alignedRot[0]
      : step.alignedRot[0] + step.chaosRotation[0];
    const targetRy = alignment > 0.7
      ? step.alignedRot[1]
      : step.alignedRot[1] + step.chaosRotation[1];
    const targetRz = alignment > 0.7
      ? step.alignedRot[2]
      : step.alignedRot[2] + step.chaosRotation[2];

    meshRef.current.rotation.x += (targetRx - meshRef.current.rotation.x) * lerpSpeed;
    meshRef.current.rotation.y += (targetRy - meshRef.current.rotation.y) * lerpSpeed;
    meshRef.current.rotation.z += (targetRz - meshRef.current.rotation.z) * lerpSpeed;

    const emissiveStr = alignment * 0.4;
    matRef.current.emissiveIntensity = emissiveStr;
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow
      position={[
        step.alignedPos[0] + step.chaosOffset[0],
        step.alignedPos[1] + step.chaosOffset[1],
        step.alignedPos[2] + step.chaosOffset[2],
      ]}
      rotation={[
        step.alignedRot[0] + step.chaosRotation[0],
        step.alignedRot[1] + step.chaosRotation[1],
        step.alignedRot[2] + step.chaosRotation[2],
      ]}
    >
      <boxGeometry args={step.size} />
      <meshStandardMaterial
        ref={matRef}
        color={step.color}
        roughness={0.3}
        metalness={0.5}
        emissive={step.color}
        emissiveIntensity={0}
      />
    </mesh>
  );
}

interface AnamorphicRoomProps {
  position?: [number, number, number];
}

export function AnamorphicRoom({ position = [-18, 0, 0] }: AnamorphicRoomProps) {
  const { camera } = useThree();
  const alignmentRef = useRef(0);
  const sweetSpotWorld = useMemo(() => SWEET_SPOT.clone().add(new Vector3(...position)), [position]);

  useFrame(() => {
    const dist = camera.position.distanceTo(sweetSpotWorld);
    alignmentRef.current = Math.max(0, 1 - dist / ALIGNMENT_RADIUS);
  });

  return (
    <group position={position}>
      <ambientLight intensity={0.3} color="#220033" />
      <pointLight position={[0, 5, 0]} intensity={2} color="#6633aa" distance={20} />
      <pointLight position={[5, 1, -5]} intensity={1} color="#3344cc" distance={15} />
      <pointLight position={[-5, 1, -5]} intensity={1} color="#cc3366" distance={15} />

      <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0d0a14" roughness={0.9} />
      </mesh>

      {[-10, 10].map((x) => (
        <mesh key={x} position={[x, 4, -2]} receiveShadow>
          <planeGeometry args={[0.1, 8]} />
          <meshStandardMaterial color="#1a0a2e" />
        </mesh>
      ))}

      {STEPS.map((step, i) => (
        <FloatingBlock key={i} step={step} alignment={alignmentRef.current} />
      ))}

      <mesh position={[0, 0.01, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[ALIGNMENT_RADIUS, 32]} />
        <meshStandardMaterial color="#6633aa" transparent opacity={0.15} emissive="#6633aa" emissiveIntensity={0.3} />
      </mesh>

      <RigidBody type="fixed" position={[0, 0, 0]}>
        <mesh visible={false} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}
