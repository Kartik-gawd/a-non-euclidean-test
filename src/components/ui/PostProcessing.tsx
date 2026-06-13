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
import { useGameStore } from '../store/gameStore';

const _offset = new Vector2(0, 0);

export function PostProcessing() {
  const isPointerLocked = useGameStore((s) => s.isPointerLocked);

  const chromaOffsetRef = useRef(new Vector2(0.0005, 0.0005));
  const targetChromaRef = useRef(new Vector2(0.0005, 0.0005));

  useFrame((_, delta) => {
    const t = delta * 4;
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
