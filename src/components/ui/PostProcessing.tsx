import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  EffectComposer,
  Vignette,
  ChromaticAberration,
  Noise,
  Bloom,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import { useGameStore } from '../../store/gameStore';

export function PostProcessing() {
  const chromaOffsetRef = useRef(new Vector2(0.0005, 0.0005));
  const targetChromaRef = useRef(new Vector2(0.0005, 0.0005));

  const teleportTimeRef = useRef(0);

  useFrame((_, delta) => {
    const { teleportRequest } = useGameStore.getState();
    
    if (teleportRequest && teleportRequest.time !== teleportTimeRef.current) {
      teleportTimeRef.current = teleportRequest.time;
      // Spike chromatic aberration
      chromaOffsetRef.current.set(0.05, 0.05);
    }
    
    // Smoothly decay back to normal
    targetChromaRef.current.set(0.001, 0.001);
    const t = delta * 10;
    chromaOffsetRef.current.lerp(targetChromaRef.current, t);
  });

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.4}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.9}
        blendFunction={BlendFunction.ADD}
      />
      <ChromaticAberration
        offset={chromaOffsetRef.current}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0.5}
      />
      <Vignette
        offset={0.35}
        darkness={0.6}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        opacity={0.025}
        blendFunction={BlendFunction.ADD}
      />
    </EffectComposer>
  );
}
