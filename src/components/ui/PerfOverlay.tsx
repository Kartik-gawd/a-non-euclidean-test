import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: '12px',
  left: '12px',
  zIndex: 100,
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#00ff88',
  background: 'rgba(0,0,0,0.55)',
  padding: '8px 12px',
  borderRadius: '6px',
  pointerEvents: 'none',
  userSelect: 'none',
  minWidth: '200px',
};

export function PerfOverlay() {
  const debugMode     = useGameStore((s) => s.debugMode);
  const toggleDebug   = useGameStore((s) => s.toggleDebug);
  const isPointerLocked = useGameStore((s) => s.isPointerLocked);

  // FPS tracking via requestAnimationFrame (no R3F dependency)
  const fpsRef        = useRef<HTMLSpanElement>(null);
  const posRef        = useRef<HTMLSpanElement>(null);
  const groundedRef   = useRef<HTMLSpanElement>(null);
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef   = useRef<number>(performance.now());
  const rafRef        = useRef<number>(0);

  useEffect(() => {
    if (!debugMode) return;

    const tick = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) frameTimesRef.current.shift();

      const avgDelta =
        frameTimesRef.current.reduce((a, b) => a + b, 0) /
        frameTimesRef.current.length;
      const fps = Math.round(1000 / avgDelta);

      if (fpsRef.current) fpsRef.current.textContent = `${fps}`;

      // Read latest from store (avoid subscribing to fast-changing state)
      const state = useGameStore.getState();
      const p = state.playerPosition;
      if (posRef.current) {
        posRef.current.textContent =
          `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`;
      }
      if (groundedRef.current) {
        groundedRef.current.textContent = state.isGrounded ? 'yes' : 'no';
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [debugMode]);

  if (!debugMode) return null;

  return (
    <div style={overlayStyle}>
      <div>
        <b>FPS</b> <span ref={fpsRef}>--</span>
      </div>
      <div>
        <b>POS</b>{' '}
        <span ref={posRef} style={{ fontSize: '11px' }}>
          --, --, --
        </span>
      </div>
      <div>
        <b>GROUNDED</b> <span ref={groundedRef}>--</span>
      </div>
      <div>
        <b>LOCKED</b> {isPointerLocked ? 'yes' : 'no'}
      </div>
      <div style={{ marginTop: '6px', opacity: 0.6, fontSize: '10px' }}>
        [F3] toggle debug &nbsp;|&nbsp; [Esc] unlock
      </div>
      <div style={{ opacity: 0.6, fontSize: '10px' }}>
        Click canvas to lock pointer
      </div>

      <DebugToggleListener onToggle={toggleDebug} locked={isPointerLocked} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper — keyboard listener for F3 (mount once, no visible output)
// ---------------------------------------------------------------------------

function DebugToggleListener({
  onToggle,
  locked,
}: {
  onToggle: () => void;
  locked: boolean;
}) {
  useEffect(() => {
    if (locked) return; // don't intercept when pointer is locked

    const handler = (e: KeyboardEvent) => {
      if (e.code === 'F3') {
        e.preventDefault();
        onToggle();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [locked, onToggle]);

  return null;
}
