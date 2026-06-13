import { useEffect, useRef } from 'react';
import { PointerLockControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

function MobileLookControls() {
  const { camera, gl } = useThree();

  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    yaw.current = camera.rotation.y;
    pitch.current = camera.rotation.x;

    const sensitivity = 0.003;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      dragging.current = true;
      lastX.current = touch.clientX;
      lastY.current = touch.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;

      const touch = e.touches[0];

      const dx = touch.clientX - lastX.current;
      const dy = touch.clientY - lastY.current;

      lastX.current = touch.clientX;
      lastY.current = touch.clientY;

      yaw.current -= dx * sensitivity;
      pitch.current -= dy * sensitivity;

      pitch.current = THREE.MathUtils.clamp(
        pitch.current,
        -Math.PI / 2 + 0.1,
        Math.PI / 2 - 0.1
      );
    };

    const onTouchEnd = () => {
      dragging.current = false;
    };

    const canvas = gl.domElement;

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [camera, gl]);

  useFrame(() => {
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
  });

  return null;
}

export function Controls() {
  const { gl } = useThree();
  const setPointerLocked = useGameStore((s) => s.setPointerLocked);

  const isMobile =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0);

  useEffect(() => {
    if (isMobile) {
      setPointerLocked(true);
      return;
    }

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === gl.domElement;

      setPointerLocked(locked);

      if (locked) {
        document.body.classList.add('pointer-locked');
      } else {
        document.body.classList.remove('pointer-locked');
      }
    };

    document.addEventListener(
      'pointerlockchange',
      handlePointerLockChange
    );

    return () => {
      document.removeEventListener(
        'pointerlockchange',
        handlePointerLockChange
      );
      document.body.classList.remove('pointer-locked');
    };
  }, [gl.domElement, isMobile, setPointerLocked]);

  if (isMobile) {
    return <MobileLookControls />;
  }

  return (
    <PointerLockControls
      selector="canvas"
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
    />
  );
}
