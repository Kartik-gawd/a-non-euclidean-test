import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, interactionGroups, useRapier } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useInput } from '../utils/useInput';
import { useGameStore } from '../store/gameStore';

const CAPSULE_HEIGHT = 1.8;
const CAPSULE_RADIUS = 0.35;
const EYE_HEIGHT = CAPSULE_HEIGHT * 0.45;

const MOVE_SPEED = 6;
const SPRINT_MULTIPLIER = 1.7;
const JUMP_IMPULSE = 8.5;
const GROUND_DAMPING = 0.82;

export function Player() {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { inputRef: inputStateRef } = useInput();
  const { camera } = useThree();
  const { rapier, world } = useRapier();

  const setGrounded = useGameStore((s) => s.setGrounded);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);

  const jumpConsumedRef = useRef(false);
  const interactConsumedRef = useRef(false);
  const lastTeleportTime = useRef(0);

  useFrame((_state, delta) => {
    const body = rigidBodyRef.current;
    if (!body) return;

    const input = inputStateRef.current;

    let bodyPos = body.translation();
    let bodyLinVel = body.linvel();

    const { teleportRequest, gravityDirection } = useGameStore.getState();
    const up = gravityDirection.clone().multiplyScalar(-1);

    if (teleportRequest && teleportRequest.time > lastTeleportTime.current) {
      lastTeleportTime.current = teleportRequest.time;
      body.setTranslation(teleportRequest.pos, true);
      
      const velVec = new Vector3(bodyLinVel.x, bodyLinVel.y, bodyLinVel.z);
      velVec.applyQuaternion(teleportRequest.rotDelta);
      body.setLinvel({ x: velVec.x, y: velVec.y, z: velVec.z }, true);
      
      bodyPos = { x: teleportRequest.pos.x, y: teleportRequest.pos.y, z: teleportRequest.pos.z };
      bodyLinVel = { x: velVec.x, y: velVec.y, z: velVec.z };

      // Teleport held object safely!
      const { heldObject, currentDimension } = useGameStore.getState();
      if (heldObject) {
         if (heldObject.userData && heldObject.userData.teleport) {
            heldObject.userData.teleport(teleportRequest.pos, teleportRequest.rotDelta, currentDimension);
         }
      }
    }

    const velVec = new Vector3(bodyLinVel.x, bodyLinVel.y, bodyLinVel.z);
    const upVel = velVec.dot(up);
    const planeVel = velVec.clone().sub(up.clone().multiplyScalar(upVel));

    // Start the ray slightly below the bottom of the capsule to prevent self-collision
    const origin = new Vector3(bodyPos.x, bodyPos.y, bodyPos.z).add(up.clone().multiplyScalar(-CAPSULE_HEIGHT / 2 - 0.05));
    const rayDir = up.clone().multiplyScalar(-1);
    const ray = new rapier.Ray(origin, rayDir);
    const curDim = useGameStore.getState().currentDimension;
    // We cast downwards for 0.4 units
    const hit = world.castRay(ray, 0.4, true, interactionGroups(curDim, [curDim]));
    const isGrounded = hit !== null;
    setGrounded(isGrounded);

    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    right.projectOnPlane(up).normalize();
    forward.projectOnPlane(up).normalize();

    const direction = new Vector3();
    if (input.forward) direction.add(forward);
    if (input.backward) direction.sub(forward);
    if (input.left) direction.sub(right);
    if (input.right) direction.add(right);
    if (direction.lengthSq() > 0) direction.normalize();

    const speed = input.sprint ? MOVE_SPEED * SPRINT_MULTIPLIER : MOVE_SPEED;
    const desiredPlaneVel = direction.multiplyScalar(speed);

    if (isGrounded) {
      planeVel.lerp(desiredPlaneVel, 1 - GROUND_DAMPING);
    } else {
      // In air, we still lerp to desired velocity but much slower, acting as air control
      planeVel.lerp(desiredPlaneVel, delta * 2.0);
    }

    let newUpVel = upVel;
    if (input.jump && isGrounded && !jumpConsumedRef.current) {
      newUpVel = JUMP_IMPULSE;
      jumpConsumedRef.current = true;
    }
    if (!input.jump) jumpConsumedRef.current = false;

    if (!isGrounded) {
      newUpVel -= 25.0 * delta;
    }

    const finalVel = planeVel.add(up.clone().multiplyScalar(newUpVel));
    body.setLinvel(finalVel, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    const eyeOffset = up.clone().multiplyScalar(EYE_HEIGHT);
    const targetPos = new Vector3(bodyPos.x, bodyPos.y, bodyPos.z).add(eyeOffset);
    
    camera.position.copy(targetPos);
    setPlayerPosition(new Vector3(bodyPos.x, bodyPos.y, bodyPos.z));

    const { heldObject, setHeldObject, currentDimension, setCanGrab } = useGameStore.getState();

    const hoverRayDir = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    // Offset the ray origin forward by 0.4 units so it starts outside the player's own collision capsule!
    const hoverOrigin = camera.position.clone().add(hoverRayDir.clone().multiplyScalar(0.4));
    const hoverRay = new rapier.Ray(hoverOrigin, hoverRayDir);
    const hoverHit = world.castRay(hoverRay, 3.0, true, interactionGroups(currentDimension, [currentDimension]));
    
    let isGrabbable = false;
    if (hoverHit && hoverHit.collider) {
      const rb = hoverHit.collider.parent();
      if (rb && rb.bodyType() === rapier.RigidBodyType.Dynamic && rb !== body) {
        isGrabbable = true;
      }
    }
    setCanGrab(isGrabbable);

    if (input.interact && !interactConsumedRef.current) {
      interactConsumedRef.current = true;
      if (heldObject) {
        setHeldObject(null);
      } else if (isGrabbable) {
        const rb = hoverHit!.collider.parent();
        setHeldObject(rb);
      }
    }
    if (!input.interact) interactConsumedRef.current = false;

    if (heldObject) {
      // Hold it 2 units in front of the camera
      const holdPos = camera.position.clone().add(new Vector3(0, 0, -2).applyQuaternion(camera.quaternion));
      heldObject.setTranslation(holdPos, true);
      heldObject.setLinvel({ x: 0, y: 0, z: 0 }, true);
      heldObject.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  const currentDimension = useGameStore((s) => s.currentDimension);

  useEffect(() => {
    // Enable layer 0 (global) and the current dimension's layer
    camera.layers.disableAll();
    camera.layers.enable(0);
    if (currentDimension !== 0) {
      camera.layers.enable(currentDimension);
    }
    
    // Manually update collision groups since @react-three/rapier may not reactively update it
    const body = rigidBodyRef.current;
    if (body) {
      for (let i = 0; i < body.numColliders(); i++) {
        const collider = body.collider(i);
        collider.setCollisionGroups(interactionGroups(currentDimension, [currentDimension]));
      }
    }
  }, [camera, currentDimension]);

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
      gravityScale={0}
      ccd={true}
      collisionGroups={interactionGroups(currentDimension, [currentDimension])}
      userData={{ isPlayer: true }}
    >
      <CapsuleCollider args={[CAPSULE_HEIGHT / 2 - CAPSULE_RADIUS, CAPSULE_RADIUS]} />
    </RigidBody>
  );
}
