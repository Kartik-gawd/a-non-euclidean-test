import { useState, useRef } from 'react';
import { CuboidCollider } from '@react-three/rapier';
import { Vector3, Quaternion } from 'three';
import { RigidBody, useDimension } from '../../core/Dimension';
import { useGameStore } from '../../store/gameStore';

export function WeightedCube({ position, id }: { position: [number, number, number]; id: string }) {
  const defaultDim = useDimension();
  const [dim, setDim] = useState(defaultDim);
  const rigidBodyRef = useRef<any>(null);

  const handleTeleport = (newPos: Vector3, rotDelta: Quaternion, targetDimension?: number) => {
    if (!rigidBodyRef.current) return;
    
    // Set physics transform
    rigidBodyRef.current.setTranslation(newPos, true);
    
    // Rotate velocity
    const vel = rigidBodyRef.current.linvel();
    const velVec = new Vector3(vel.x, vel.y, vel.z);
    velVec.applyQuaternion(rotDelta);
    rigidBodyRef.current.setLinvel(velVec, true);
    
    if (targetDimension !== undefined) {
      setDim(targetDimension);
    }
  };

  const handleSetGhost = (ghostData: any) => {
    useGameStore.getState().setGhost(id, ghostData);
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={position}
      mass={5}
      dimension={dim}
      ccd={true}
      userData={{ isTeleportable: true, id, teleport: handleTeleport, setGhost: handleSetGhost }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#88aaff" roughness={0.4} metalness={0.2} />
      </mesh>
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
    </RigidBody>
  );
}
