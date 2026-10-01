import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

export function Controls() {
  const { camera, gl } = useThree();
  const setPointerLocked = useGameStore((s) => s.setPointerLocked);
  
  const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  const lastX = useRef(0);
  const lastY = useRef(0);
  const dragging = useRef(false);

  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === gl.domElement;
      setPointerLocked(locked);
      if (locked) document.body.classList.add('pointer-locked');
      else document.body.classList.remove('pointer-locked');
    };

    if (!isMobile) {
      document.addEventListener('pointerlockchange', handlePointerLockChange);
      
      const onCanvasClick = () => {
        if (document.pointerLockElement !== gl.domElement) {
          gl.domElement.requestPointerLock();
        }
      };
      gl.domElement.addEventListener('click', onCanvasClick);
      
      return () => {
        document.removeEventListener('pointerlockchange', handlePointerLockChange);
        gl.domElement.removeEventListener('click', onCanvasClick);
        document.body.classList.remove('pointer-locked');
      };
    } else {
      setPointerLocked(true);
    }
  }, [gl.domElement, isMobile, setPointerLocked]);

  useEffect(() => {
    const sensitivity = 0.003;

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      const { cameraEuler, setCameraEuler } = useGameStore.getState();
      
      let yaw = cameraEuler.yaw - e.movementX * sensitivity;
      let pitch = cameraEuler.pitch - e.movementY * sensitivity;
      
      pitch = THREE.MathUtils.clamp(pitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
      setCameraEuler(yaw, pitch);
    };

    const onTouchStart = (e: TouchEvent) => {
      dragging.current = true;
      lastX.current = e.touches[0].clientX;
      lastY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - lastX.current;
      const dy = touch.clientY - lastY.current;
      lastX.current = touch.clientX;
      lastY.current = touch.clientY;

      const { cameraEuler, setCameraEuler } = useGameStore.getState();
      let yaw = cameraEuler.yaw - dx * sensitivity;
      let pitch = cameraEuler.pitch - dy * sensitivity;
      
      pitch = THREE.MathUtils.clamp(pitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
      setCameraEuler(yaw, pitch);
    };

    const onTouchEnd = () => { dragging.current = false; };

    if (!isMobile) {
      document.addEventListener('mousemove', onMouseMove);
      return () => document.removeEventListener('mousemove', onMouseMove);
    } else {
      const canvas = gl.domElement;
      canvas.addEventListener('touchstart', onTouchStart, { passive: true });
      canvas.addEventListener('touchmove', onTouchMove, { passive: true });
      canvas.addEventListener('touchend', onTouchEnd);
      return () => {
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
      };
    }
  }, [gl.domElement, isMobile]);

  useFrame(() => {
    const { cameraEuler, gravityDirection } = useGameStore.getState();
    const lookQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(cameraEuler.pitch, cameraEuler.yaw, 0, 'YXZ')
    );
    const upQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      gravityDirection.clone().multiplyScalar(-1)
    );
    camera.quaternion.copy(upQuat).multiply(lookQuat);
  });

  return null;
}
