import { CuboidCollider } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useGameStore } from '../../store/gameStore';
import { RigidBody } from '../../core/Dimension';

interface GravityVolumeProps {
  position: [number, number, number];
  size: [number, number, number];
  gravityDirection: [number, number, number];
}

export function GravityVolume({ position, size, gravityDirection }: GravityVolumeProps) {
  const setGravityDirection = useGameStore((s) => s.setGravityDirection);
  const isDebug = useGameStore((s) => s.debugMode);

  const handleEnter = () => {
    // Optionally check if the intersecting object is the player
    // Since player is the only dynamic body right now, this is fine
    setGravityDirection(new Vector3(...gravityDirection).normalize());
  };

  return (
    <RigidBody type="fixed" position={position} sensor onIntersectionEnter={handleEnter}>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
      {isDebug && (
        <mesh>
          <boxGeometry args={size} />
          <meshBasicMaterial color="#00ff00" wireframe transparent opacity={0.3} />
          
          {/* Arrow pointing in gravity direction */}
          <mesh position={[gravityDirection[0] * size[0]/4, gravityDirection[1] * size[1]/4, gravityDirection[2] * size[2]/4]}>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </mesh>
      )}
    </RigidBody>
  );
}
