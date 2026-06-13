import { useRef } from 'react';
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
  minResolution = 64,
  fullQualityDistance = 4,
  cullDistance = 40,
}: UsePortalResolutionOptions) {
  const { camera, size } = useThree();
  const resolutionRef = useRef<PortalResolution>({
    width: minResolution,
    height: minResolution,
    visible: false,
  });

  useFrame(() => {
    _portalPos.set(...portalPosition);
    camera.getWorldPosition(_cameraPos);

    const dist = _cameraPos.distanceTo(_portalPos);

    if (dist > cullDistance) {
      resolutionRef.current.visible = false;
      resolutionRef.current.width = minResolution;
      resolutionRef.current.height = minResolution;
      return;
    }

    resolutionRef.current.visible = true;

    const t = Math.max(0, Math.min(1, 1 - (dist - fullQualityDistance) / (cullDistance - fullQualityDistance)));
    const res = Math.round(minResolution + (maxResolution - minResolution) * t);
    const snapped = Math.pow(2, Math.round(Math.log2(res)));

    resolutionRef.current.width = snapped;
    resolutionRef.current.height = snapped;
  });

  return resolutionRef;
}
