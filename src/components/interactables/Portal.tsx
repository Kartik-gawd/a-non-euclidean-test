import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshPortalMaterial, useFBO } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh, Vector3, Quaternion, Matrix4, Vector2 } from 'three';
import type { RapierRigidBody } from '@react-three/rapier';
import type { ReactNode } from 'react';
import { useGameStore } from '../store/gameStore';

interface PortalProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  targetPosition: [number, number, number];
  targetRotation?: [number, number, number];
  children: ReactNode;
  id: string;
}

const _worldPos = new Vector3();
const _portalPos = new Vector3();
const _relPos = new Vector3();
const _portalQuat = new Quaternion();
const _invPortalMat = new Matrix4();
const _targetQuat = new Quaternion();
const _camLocalPos = new Vector3();
const _finalPos = new Vector3();
const _size = new Vector2();

export function Portal({
  position,
  rotation = [0, 0, 0],
  width = 2,
  height = 3,
  targetPosition,
  targetRotation = [0, 0, 0],
  children,
  id,
}: PortalProps) {
  const meshRef = useRef<Mesh>(null);
  const { camera, gl, size } = useThree();
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const [isNear, setIsNear] = useState(false);

  const fbo = useFBO(512, 512, { samples: 4 });

  const onEnter = useCallback(() => {
    setIsNear(true);
  }, []);

  const onExit = useCallback(() => {
    setIsNear(false);
  }, []);

  useFrame(({ gl: renderer }) => {
    if (!meshRef.current) return;

    meshRef.current.getWorldPosition(_portalPos);
    meshRef.current.getWorldQuaternion(_portalQuat);

    _invPortalMat.compose(_portalPos, _portalQuat, meshRef.current.scale);
    _invPortalMat.invert();

    camera.getWorldPosition(_worldPos);
    _relPos.copy(_worldPos).applyMatrix4(_invPortalMat);

    _targetQuat.setFromEuler(
      new (require('three').Euler)(targetRotation[0], targetRotation[1], targetRotation[2])
    );

    _camLocalPos
      .set(
        _relPos.x + targetPosition[0],
        _relPos.y + targetPosition[1],
        _relPos.z + targetPosition[2]
      );

    gl.getSize(_size);
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        <MeshPortalMaterial side={2} blur={isNear ? 0 : 0.3} worldUnits>
          {children}
        </MeshPortalMaterial>
      </mesh>

      <RigidBody type="fixed" sensor onIntersectionEnter={onEnter} onIntersectionExit={onExit}>
        <CuboidCollider args={[width / 2, height / 2, 0.15]} />
      </RigidBody>

      {isNear && (
        <TeleportTrigger
          portalId={id}
          portalPosition={position}
          portalRotation={rotation}
          targetPosition={targetPosition}
          targetRotation={targetRotation}
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
  width: number;
  height: number;
}

const _playerPos = new Vector3();
const _pPortalPos = new Vector3();
const _toPlayer = new Vector3();
const _portalNormal = new Vector3(0, 0, 1);
const _portalWorldNormal = new Vector3();
const _prevDot = { value: 0 };

function TeleportTrigger({
  portalPosition,
  portalRotation,
  targetPosition,
  targetRotation,
}: TeleportTriggerProps) {
  const { camera } = useThree();
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const teleportedRef = useRef(false);
  const prevSideRef = useRef<number>(0);

  const portalQuat = new Quaternion().setFromEuler(
    new (require('three').Euler)(portalRotation[0], portalRotation[1], portalRotation[2])
  );

  useFrame(() => {
    camera.getWorldPosition(_playerPos);
    _pPortalPos.set(...portalPosition);
    _toPlayer.subVectors(_playerPos, _pPortalPos);

    _portalWorldNormal.copy(_portalNormal).applyQuaternion(portalQuat);

    const dot = _toPlayer.dot(_portalWorldNormal);
    const prevDot = prevSideRef.current;

    if (Math.abs(dot) < 0.5 && prevDot !== 0 && Math.sign(dot) !== Math.sign(prevDot) && !teleportedRef.current) {
      teleportedRef.current = true;

      const targetEuler = new (require('three').Euler)(
        targetRotation[0],
        targetRotation[1],
        targetRotation[2]
      );
      const rotDelta = new Quaternion().setFromEuler(targetEuler);
      rotDelta.multiply(portalQuat.clone().invert());

      camera.position.set(...targetPosition);
      camera.position.x += _toPlayer.x * -1;
      camera.position.z += _toPlayer.z * -1;
      camera.quaternion.premultiply(rotDelta);

      setPlayerPosition(camera.position.clone());

      setTimeout(() => { teleportedRef.current = false; }, 500);
    }

    prevSideRef.current = dot;
  });

  return null;
}
