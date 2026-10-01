import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface UsePortalResolutionOptions {
  portalPosition: [number, number, number];
  maxResolution?: number;
  minResolution?: number;
  fullQualityDistance?: number;
  cullDistance?: number;
}

interface PortalResolution {
  width: number;
  height: number;
  visible: boolean;
}

const _portalPos = new Vector3();
const _cameraPos = new Vector3();

export function usePortalResolution({
  portalPosition,
  maxResolution = 512,
  minResolution = 128,
  fullQualityDistance = 5,
  cullDistance = 40,
}: UsePortalResolutionOptions) {
  const { camera } = useThree();
  const [resolutionState, setResolutionState] = React.useState<PortalResolution>({
    width: minResolution,
    height: minResolution,
    visible: true,
  });

  // Keep a ref to prevent unnecessary state updates
  const currentRes = useRef(resolutionState);

  useFrame(() => {
    _portalPos.set(...portalPosition);
    camera.getWorldPosition(_cameraPos);

    const dist = _cameraPos.distanceTo(_portalPos);

    let nextVisible = true;
    let nextWidth = minResolution;

    if (dist > cullDistance) {
      nextVisible = false;
      nextWidth = minResolution;
    } else {
      nextVisible = true;
      const t = Math.max(0, Math.min(1, 1 - (dist - fullQualityDistance) / (cullDistance - fullQualityDistance)));
      const res = Math.round(minResolution + (maxResolution - minResolution) * t);
      nextWidth = Math.pow(2, Math.round(Math.log2(res)));
    }

    if (currentRes.current.width !== nextWidth || currentRes.current.visible !== nextVisible) {
      const newState = { width: nextWidth, height: nextWidth, visible: nextVisible };
      currentRes.current = newState;
      setResolutionState(newState);
    }
  });

  return resolutionState;
}
