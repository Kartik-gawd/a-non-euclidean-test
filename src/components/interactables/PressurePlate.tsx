import { useState, useRef } from 'react';
import { CuboidCollider } from '@react-three/rapier';
import { RigidBody } from '../../core/Dimension';

interface PressurePlateProps {
  position: [number, number, number];
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export function PressurePlate({ position, onActivate, onDeactivate }: PressurePlateProps) {
  const [active, setActive] = useState(false);
  const intersectCount = useRef(0);

  const handleEnter = () => {
    intersectCount.current++;
    if (intersectCount.current === 1) {
      setActive(true);
      if (onActivate) onActivate();
    }
  };

  const handleExit = () => {
    intersectCount.current = Math.max(0, intersectCount.current - 1);
    if (intersectCount.current === 0) {
      setActive(false);
      if (onDeactivate) onDeactivate();
    }
  };

  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2, 0.1, 2]} />
        <meshStandardMaterial color={active ? '#00ff00' : '#ff0000'} roughness={0.7} />
      </mesh>
      
      {/* Sensor */}
      <RigidBody type="fixed" position={[0, 0.15, 0]} sensor onIntersectionEnter={handleEnter} onIntersectionExit={handleExit}>
        <CuboidCollider args={[0.9, 0.1, 0.9]} />
      </RigidBody>

      {/* Solid base */}
      <RigidBody type="fixed" position={[0, 0.05, 0]}>
        <CuboidCollider args={[1, 0.05, 1]} />
      </RigidBody>
    </group>
  );
}
