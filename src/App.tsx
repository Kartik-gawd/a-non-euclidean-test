import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { Suspense } from 'react';
import { Perf } from 'r3f-perf';

import { PhysicsWorld }   from './core/PhysicsWorld';
import { Player }         from './core/Player';
import { Controls }       from './core/Controls';
import { PrimaryWorld }   from './scenes/PrimaryWorld';
import { PerfOverlay }    from './components/ui/PerfOverlay';
import { useGameStore }   from './store/gameStore';

import './App.css';

export default function App() {
  const debugMode       = useGameStore((s) => s.debugMode);
  const isPointerLocked = useGameStore((s) => s.isPointerLocked);

  return (
    <div className="app-root">
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          outputColorSpace: SRGBColorSpace,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{
          fov: 75,
          near: 0.05,
          far: 500,
          position: [0, 2, 5],
        }}
        dpr={[1, 2]}
        flat={false}
      >
        <color attach="background" args={['#e2e8f0']} />
        {debugMode && <Perf position="top-right" />}

        <Suspense fallback={null}>
          <PhysicsWorld>
            <Player />
            <PrimaryWorld />
          </PhysicsWorld>
        </Suspense>

        <Controls />
      </Canvas>

      <PerfOverlay />

      {isPointerLocked && <div className="crosshair" aria-hidden="true" />}

      {!isPointerLocked && (
        <div className="lock-prompt" aria-live="polite">
          <p>Click to enter &nbsp;·&nbsp; Esc to exit</p>
        </div>
      )}
    </div>
  );
}
