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
  minWidth: '220px',
};

const dimStyle: React.CSSProperties = { opacity: 0.6, fontSize: '10px' };
const sepStyle: React.CSSProperties = { borderTop: '1px solid rgba(0,255,136,0.2)', margin: '4px 0' };

export function PerfOverlay() {
  const debugMode       = useGameStore((s) => s.debugMode);
  const toggleDebug     = useGameStore((s) => s.toggleDebug);
  const isPointerLocked = useGameStore((s) => s.isPointerLocked);
  const loopCount       = useGameStore((s) => s.loopCount);

  const fpsRef      = useRef<HTMLSpanElement>(null);
  const posRef      = useRef<HTMLSpanElement>(null);
  const groundedRef = useRef<HTMLSpanElement>(null);
  const alignRef    = useRef<HTMLSpanElement>(null);
  const rafRef      = useRef<number>(0);
  const frameTimes  = useRef<number[]>([]);
  const lastTime    = useRef(performance.now());

  useEffect(() => {
    if (!debugMode) return;
    const tick = (now: number) => {
      const delta = now - lastTime.current;
      lastTime.current = now;
      frameTimes.current.push(delta);
      if (frameTimes.current.length > 30) frameTimes.current.shift();
      const avg = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
      if (fpsRef.current) fpsRef.current.textContent = `${Math.round(1000 / avg)}`;
      const s = useGameStore.getState();
      const p = s.playerPosition;
      if (posRef.current) posRef.current.textContent = `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`;
      if (groundedRef.current) groundedRef.current.textContent = s.isGrounded ? 'yes' : 'no';
      if (alignRef.current) alignRef.current.textContent = `${(s.anamorphicAlignment * 100).toFixed(0)}%`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [debugMode]);

  if (!debugMode) return null;

  return (
    <div style={overlayStyle}>
      <div><b>FPS</b> <span ref={fpsRef}>--</span></div>
      <div><b>POS</b> <span ref={posRef} style={{ fontSize: '11px' }}>--, --, --</span></div>
      <div><b>GROUNDED</b> <span ref={groundedRef}>--</span></div>
      <div><b>LOCKED</b> {isPointerLocked ? 'yes' : 'no'}</div>
      <div style={sepStyle} />
      <div><b>LOOP #</b> {loopCount}</div>
      <div><b>ALIGN</b> <span ref={alignRef}>0%</span></div>
      <div style={sepStyle} />
      <div style={dimStyle}>[F3] toggle debug &nbsp;|&nbsp; [Esc] unlock</div>
      <div style={dimStyle}>
        <b style={{ color: '#88aaff' }}>TARDIS</b> z=-12 &nbsp;
        <b style={{ color: '#ff8888' }}>LOOP</b> x=10 &nbsp;
        <b style={{ color: '#aa88ff' }}>ANA</b> x=-20
      </div>
      <DebugToggleListener onToggle={toggleDebug} locked={isPointerLocked} />
    </div>
  );
}

function DebugToggleListener({ onToggle, locked }: { onToggle: () => void; locked: boolean }) {
  useEffect(() => {
    if (locked) return;
    const h = (e: KeyboardEvent) => { if (e.code === 'F3') { e.preventDefault(); onToggle(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [locked, onToggle]);
  return null;
}
