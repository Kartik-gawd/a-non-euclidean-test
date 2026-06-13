import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier';
import { Vector3, Euler, Quaternion } from 'three';
import { useInput } from '../utils/useInput';
import { useGameStore } from '../store/gameStore';

const CAPSULE_HEIGHT = 1.8;
const CAPSULE_RADIUS = 0.35;
const EYE_HEIGHT = CAPSULE_HEIGHT * 0.45;

const MOVE_SPEED = 6;
const SPRINT_MULTIPLIER = 1.7;
const JUMP_IMPULSE = 5.5;
const GROUND_DAMPING = 0.82;
const GROUND_CHECK_OFFSET = 0.12;

const _velocity = new Vector3();
const _direction = new Vector3();
const _euler = new Euler(0, 0, 0, 'YXZ');
const _quaternion = new Quaternion();
const _camWorldPos = new Vector3();
const _targetPos = new Vector3();

export function Player() {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const inputRef = useInput();
  const { camera } = useThree();

  const setGrounded = useGameStore((s) => s.setGrounded);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);

  const jumpConsumedRef = useRef(false);

  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT + 2, 5);
  }, [camera]);

  useFrame((_state, delta) => {
    const body = rigidBodyRef.current;
    if (!body) return;

    const input = inputRef.current;

    const bodyPos = body.translation();
    const bodyLinVel = body.linvel();

    const isGrounded = Math.abs(bodyLinVel.y) < GROUND_CHECK_OFFSET;
    setGrounded(isGrounded);

    _euler.setFromQuaternion(camera.quaternion, 'YXZ');
    const yaw = _euler.y;

    _direction.set(0, 0, 0);

    if (input.forward) _direction.z -= 1;
    if (input.backward) _direction.z += 1;
    if (input.left) _direction.x -= 1;
    if (input.right) _direction.x += 1;

    _direction.normalize();

    _quaternion.setFromEuler(new Euler(0, yaw, 0));
    _direction.applyQuaternion(_quaternion);

    const speed = input.sprint
      ? MOVE_SPEED * SPRINT_MULTIPLIER
      : MOVE_SPEED;

    const desiredVx = _direction.x * speed;
    const desiredVz = _direction.z * speed;

    const dampedVx = isGrounded
      ? bodyLinVel.x * GROUND_DAMPING + desiredVx * (1 - GROUND_DAMPING)
      : bodyLinVel.x + desiredVx * delta * 8;

    const dampedVz = isGrounded
      ? bodyLinVel.z * GROUND_DAMPING + desiredVz * (1 - GROUND_DAMPING)
      : bodyLinVel.z + desiredVz * delta * 8;

    let newVy = bodyLinVel.y;

    if (input.jump && isGrounded && !jumpConsumedRef.current) {
      newVy = JUMP_IMPULSE;
      jumpConsumedRef.current = true;
    }

    if (!input.jump) {
      jumpConsumedRef.current = false;
    }

    body.setLinvel(
      {
        x: dampedVx,
        y: newVy,
        z: dampedVz,
      },
      true
    );

    body.setAngvel(
      {
        x: 0,
        y: 0,
        z: 0,
      },
      true
    );

    _targetPos.set(
      bodyPos.x,
      bodyPos.y + EYE_HEIGHT,
      bodyPos.z
    );

    camera.position.copy(_targetPos);

    _camWorldPos.set(
      bodyPos.x,
      bodyPos.y,
      bodyPos.z
    );

    setPlayerPosition(_camWorldPos.clone());
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      mass={70}
      type="dynamic"
      position={[0, 2, 5]}
      enabledRotations={[false, false, false]}
      linearDamping={0}
      angularDamping={0}
    >
      <CapsuleCollider
        args={[
          CAPSULE_HEIGHT / 2 - CAPSULE_RADIUS,
          CAPSULE_RADIUS,
        ]}
      />
    </RigidBody>
  );
}
