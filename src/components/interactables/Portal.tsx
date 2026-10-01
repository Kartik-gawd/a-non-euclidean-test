import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshPortalMaterial } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh, Vector3, Quaternion, Matrix4, Vector2, Euler } from 'three';
import type { ReactNode } from 'react';
import { useGameStore } from '../../store/gameStore';
import { usePortalResolution } from '../../utils/usePortalResolution';

interface PortalProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  targetPosition: [number, number, number];
  targetRotation?: [number, number, number];
  targetDimension?: number;
  children: ReactNode;
  id: string;
  teleport?: boolean;      // default true
  blur?: number;           // default: isNear ? 0 : 0.3
  alwaysVisible?: boolean;
}

const _worldPos = new Vector3();
const _portalPos = new Vector3();
const _relPos = new Vector3();
const _portalQuat = new Quaternion();
const _invPortalMat = new Matrix4();
const _targetQuat = new Quaternion();
const _camLocalPos = new Vector3();
const _size = new Vector2();

export function Portal({
  position,
  rotation = [0, 0, 0],
  width = 2,
  height = 3,
  targetPosition,
  targetRotation = [0, 0, 0],
  targetDimension,
  children,
  id,
  teleport,
  blur,
  alwaysVisible,
}: PortalProps) {
  const meshRef = useRef<Mesh>(null);
  const { camera, gl } = useThree();
  const [isNear, setIsNear] = useState(false);

  const onEnter = useCallback(() => {
    setIsNear(true);
  }, []);

  const onExit = useCallback(() => {
    setIsNear(false);
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.getWorldPosition(_portalPos);
    meshRef.current.getWorldQuaternion(_portalQuat);

    _invPortalMat.compose(_portalPos, _portalQuat, meshRef.current.scale);
    _invPortalMat.invert();

    camera.getWorldPosition(_worldPos);
    _relPos.copy(_worldPos).applyMatrix4(_invPortalMat);

    _targetQuat.setFromEuler(
      new Euler(targetRotation[0], targetRotation[1], targetRotation[2])
    );
    
    _camLocalPos
      .set(
        _relPos.x + targetPosition[0],
        _relPos.y + targetPosition[1],
        _relPos.z + targetPosition[2]
      );

    gl.getSize(_size);
  });

  const portalRes = usePortalResolution({
    portalPosition: position,
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        <MeshPortalMaterial side={2} worldUnits
          blur={blur ?? (isNear ? 0 : 0.3)}
          resolution={portalRes.width}>
          {alwaysVisible || portalRes.visible ? children : null}
        </MeshPortalMaterial>
      </mesh>

      <RigidBody type="fixed" sensor onIntersectionEnter={onEnter} onIntersectionExit={onExit}>
        <CuboidCollider args={[width / 2, height / 2, 0.15]} />
      </RigidBody>

      {teleport !== false && isNear && (
        <TeleportTrigger
          portalId={id}
          portalPosition={position}
          portalRotation={rotation}
          targetPosition={targetPosition}
          targetRotation={targetRotation}
          targetDimension={targetDimension}
          width={width}
          height={height}
        />
      )}
    </group>
  );
}

interface TeleportTriggerProps {
  portalId: string;
  portalPosition: [number, number, number];
  portalRotation: [number, number, number];
  targetPosition: [number, number, number];
  targetRotation: [number, number, number];
  targetDimension?: number;
  width: number;
  height: number;
}

const _playerPos = new Vector3();
const _pPortalPos = new Vector3();
const _toPlayer = new Vector3();
const _portalNormal = new Vector3(0, 0, 1);
const _portalWorldNormal = new Vector3();

function TeleportTrigger({
  portalPosition,
  portalRotation,
  targetPosition,
  targetRotation,
  targetDimension,
  width,
  height,
}: TeleportTriggerProps) {
  const { camera } = useThree();
  const teleportedRef = useRef(false);
  const prevSideRef = useRef<number>(0);
  
  // Track rigid body objects (from Three.js Object3D representations)
  const trackedObjects = useRef<Set<any>>(new Set());

  const portalQuat = new Quaternion().setFromEuler(
    new Euler(portalRotation[0], portalRotation[1], portalRotation[2])
  );

  const handleIntersectEnter = (e: any) => {
    if (e.rigidBodyObject) {
      trackedObjects.current.add(e.rigidBodyObject);
    }
  };

  const handleIntersectExit = (e: any) => {
    if (e.rigidBodyObject) {
      trackedObjects.current.delete(e.rigidBodyObject);
      if (e.rigidBodyObject.userData) {
        delete e.rigidBodyObject.userData.prevDot;
        if (e.rigidBodyObject.userData.setGhost) {
          e.rigidBodyObject.userData.setGhost(null);
        }
      }
    }
  };

  useFrame(() => {
    _pPortalPos.set(...portalPosition);
    _portalWorldNormal.copy(_portalNormal).applyQuaternion(portalQuat);

    // 1. Process Player Camera (Legacy, but good for smooth view teleport)
    camera.getWorldPosition(_playerPos);
    _toPlayer.subVectors(_playerPos, _pPortalPos);
    
    const localVec = _toPlayer.clone().applyQuaternion(portalQuat.clone().invert());
    const inBounds = Math.abs(localVec.x) <= (width || 2) / 2 && Math.abs(localVec.y) <= (height || 3) / 2;

    const dot = _toPlayer.dot(_portalWorldNormal);
    const prevDot = prevSideRef.current;

    if (inBounds && Math.abs(dot) < 0.5 && prevDot !== 0 && Math.sign(dot) !== Math.sign(prevDot) && !teleportedRef.current) {
      teleportedRef.current = true;

      const targetEuler = new Euler(...targetRotation);
      const rotDelta = new Quaternion().setFromEuler(targetEuler);
      const newPos = new Vector3(...targetPosition);
      newPos.x += _toPlayer.x * -1;
      newPos.z += _toPlayer.z * -1;
      newPos.y += _toPlayer.y;
      newPos.y -= 0.81; // Player eye offset

      const store = useGameStore.getState();
      store.requestTeleport(newPos, rotDelta);
      if (targetDimension !== undefined) {
        store.setCurrentDimension(targetDimension);
      }

      setTimeout(() => { teleportedRef.current = false; }, 500);
    }
    prevSideRef.current = dot;

    // 2. Process Tracked Physics Objects
    trackedObjects.current.forEach((obj) => {
      // Check if this object is teleportable
      if (!obj.userData || !obj.userData.isTeleportable || obj.userData.isTeleporting) return;
      // obj is a Three.js Object3D (rigidBodyObject), use getWorldPosition not .translation()
      if (typeof obj.getWorldPosition !== 'function') return;

      obj.getWorldPosition(_playerPos);
      _toPlayer.subVectors(_playerPos, _pPortalPos);
      
      const objLocal = _toPlayer.clone().applyQuaternion(portalQuat.clone().invert());
      const objInBounds = Math.abs(objLocal.x) <= (width || 2) / 2 && Math.abs(objLocal.y) <= (height || 3) / 2;

      const objDot = _toPlayer.dot(_portalWorldNormal);
      const prevObjDot = obj.userData.prevDot ?? 0;

      if (objInBounds && Math.abs(objDot) < 0.5 && prevObjDot !== 0 && Math.sign(objDot) !== Math.sign(prevObjDot)) {
        obj.userData.isTeleporting = true;
        
        if (obj.userData.teleport) {
          const targetEuler = new Euler(...targetRotation);
          const rotDelta = new Quaternion().setFromEuler(targetEuler);
          const newPos = new Vector3(...targetPosition);
          newPos.x += _toPlayer.x * -1;
          newPos.z += _toPlayer.z * -1;
          newPos.y += _toPlayer.y;
          
          obj.userData.teleport(newPos, rotDelta, targetDimension);
          trackedObjects.current.delete(obj);
        }

        setTimeout(() => { 
          if (obj && obj.userData) obj.userData.isTeleporting = false; 
        }, 500);
      } else if (obj.userData.setGhost) {
        // Render clone on the other side while crossing
          const targetEuler = new Euler(...targetRotation);
          const rotDelta = new Quaternion().setFromEuler(targetEuler);
        const newPos = new Vector3(...targetPosition);
        newPos.x += _toPlayer.x * -1;
        newPos.z += _toPlayer.z * -1;
        newPos.y += _toPlayer.y;
        obj.userData.setGhost({ pos: newPos, rot: rotDelta, dim: targetDimension });
      }
      obj.userData.prevDot = objDot;
    });
  });

  return (
    <RigidBody type="fixed" position={portalPosition} rotation={portalRotation} sensor onIntersectionEnter={handleIntersectEnter} onIntersectionExit={handleIntersectExit}>
      <CuboidCollider args={[width / 2, height / 2, 2.0]} />
    </RigidBody>
  );
}
