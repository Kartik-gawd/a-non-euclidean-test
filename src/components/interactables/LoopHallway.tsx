import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider } from '@react-three/rapier';
import { BufferAttribute, Color, MeshBasicMaterial, PlaneGeometry, Quaternion, Vector3 } from 'three';
import type { BufferGeometry, Group } from 'three';
import { RigidBody } from '../../core/Dimension';
import { Portal } from './Portal';
import { useGameStore } from '../../store/gameStore';

// ─────────────────────────────────────────────────────────────────────────────
// The whole illusion rests on ONE rule:
//
//   teleport  = translate the player by  +LOOP_SHIFT on z
//   the view  = a copy of the hallway translated by -LOOP_SHIFT on z
//
// The copy is T⁻¹(hallway), the teleport is T. After the teleport the player
// looks at T(T⁻¹(hallway)) = hallway, i.e. exactly what they were already seeing.
// No rotation, no mirroring, no eye-height constant, so nothing can drift.
// ─────────────────────────────────────────────────────────────────────────────

const L = 20; // period of the loop (the building is slightly longer, see BUILD)
const W = 3;
const H = 3;
const SHELL = 0.2;
const PAD = 1; // colliders overshoot both ends
const LOOP_SHIFT = L;

// Cubes: equally spaced. Each cube IS a light (same position).
const CUBES_PER_PERIOD = 4;
const CUBE_SPACING = L / CUBES_PER_PERIOD; // 5 m
const CUBE_Y = 2;
const LIGHT_DISTANCE = 10;
const GHOST_PERIODS = 7; // extra hallways visible through each window
const LIGHT_INTENSITY = 30; // how hard each cube emits (was 3)
const AMBIENT = 0.4; // small fill so the gaps between cubes aren't black
const LIGHT_GAIN = 1; // global brightness knob on top of the above
const CUBE_GLOW = 3; // brightness of the cube faces themselves (was 2)
const SEG = 0.25; // lighting resolution in metres (smaller = smoother, more vertices)

// Quad / wrap layout along z (0 = entrance mouth, negative = deeper)
const M = 0.3; // eye-to-quad distance at which we wrap (keeps the quad out of the near plane)
const DEAD = 0.3; // extra room so the landing spot (-0.65) stays clear of the entrance quad
const EDGE = 0.05; // quads sit this far inside the building ends
const BUILD = L + 2 * M + DEAD + 2 * EDGE; // 21.0
const Z_ENTRANCE_QUAD = -EDGE;
const Z_EXIT_QUAD = -BUILD + EDGE;
const WRAP_FWD = Z_EXIT_QUAD + M; // -20.65 → lands at -0.65
const ENTRANCE_HIDE_Z = Z_ENTRANCE_QUAD - 0.15; // nearer the mouth than this, the entrance window is hidden

/** z of every cube/light on the lattice inside [zMin, zMax]. Same lattice in every copy. */
function lattice(zMin: number, zMax: number) {
  const out: number[] = [];
  const jMin = Math.ceil(-zMax / CUBE_SPACING - 0.5);
  const jMax = Math.floor(-zMin / CUBE_SPACING - 0.5);
  for (let j = jMin; j <= jMax; j++) out.push(-(j + 0.5) * CUBE_SPACING);
  return out;
}

type Palette = {
  color: Color;
  cubeMaterial: MeshBasicMaterial;
  wallMaterial: MeshBasicMaterial;
  floorMaterial: MeshBasicMaterial;
};

const WALL_COLOR = new Color('#12121f');
const FLOOR_COLOR = new Color('#0e1016');

function applyPalette(p: Palette, t: number) {
  p.color.setHSL((t * 0.2) % 1, 0.8, 0.6);
  p.cubeMaterial.color.copy(p.color).multiplyScalar(CUBE_GLOW);
  p.wallMaterial.color.copy(WALL_COLOR).multiply(p.color);
  p.floorMaterial.color.copy(FLOOR_COLOR).multiply(p.color);
}

/** One colour animation shared by the real hallway and every copy. */
function useLoopPalette(): Palette {
  const palette = useMemo(() => {
    const p: Palette = {
      color: new Color(),
      cubeMaterial: new MeshBasicMaterial(),
      wallMaterial: new MeshBasicMaterial({ vertexColors: true }),
      floorMaterial: new MeshBasicMaterial({ vertexColors: true }),
    };
    applyPalette(p, 0);
    return p;
  }, []);

  useEffect(
    () => () => {
      palette.cubeMaterial.dispose();
      palette.wallMaterial.dispose();
      palette.floorMaterial.dispose();
    },
    [palette],
  );

  useFrame(({ clock }) => applyPalette(palette, clock.elapsedTime));
  return palette;
}

/**
 * Bakes the cube lights into vertex colours. Same maths as a three.js point light
 * (Lambert, 1/d² with the smooth cutoff window), but it never sees scene lights,
 * so sun / ambient / environment can't leak in.
 */
function shade(g: BufferGeometry, lights: number[]) {
  const pos = g.attributes.position;
  const nor = g.attributes.normal;
  const col = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
    const nx = nor.getX(i), ny = nor.getY(i), nz = nor.getZ(i);

    let s = AMBIENT;
    for (const lz of lights) {
      const dx = -px, dy = CUBE_Y - py, dz = lz - pz;
      const d = Math.hypot(dx, dy, dz);
      if (d >= LIGHT_DISTANCE) continue;
      const ndotl = Math.max(0, (nx * dx + ny * dy + nz * dz) / d);
      const window = 1 - (d / LIGHT_DISTANCE) ** 4;
      s += LIGHT_INTENSITY * ((window * window) / Math.max(d * d, 0.01)) * ndotl;
    }

    const v = (s / Math.PI) * LIGHT_GAIN;
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = v;
  }
  g.setAttribute('color', new BufferAttribute(col, 3));
}

/** Four planes in hallway coordinates, subdivided so the baked lighting has resolution. */
function buildHallwayGeometry(zMin: number, zMax: number, padMax: number) {
  const len = zMax - zMin;
  const zc = (zMin + zMax) / 2;
  const nz = Math.max(1, Math.round(len / SEG));
  const ny = Math.round(H / SEG);
  const nx = Math.round(W / SEG);
  const lights = lattice(zMin - LIGHT_DISTANCE, zMax + padMax);

  const left = new PlaneGeometry(len, H, nz, ny).rotateY(Math.PI / 2).translate(-W / 2, H / 2, zc);
  const right = new PlaneGeometry(len, H, nz, ny).rotateY(-Math.PI / 2).translate(W / 2, H / 2, zc);
  const floor = new PlaneGeometry(W, len, nx, nz).rotateX(-Math.PI / 2).translate(0, 0, zc);
  const ceiling = new PlaneGeometry(W, len, nx, nz).rotateX(Math.PI / 2).translate(0, H, zc);

  for (const g of [left, right, floor, ceiling]) shade(g, lights);
  return { left, right, floor, ceiling };
}

/** Open-ended tube, lit only by its own cube lattice. Spans [zMin, zMax]. */
function Hallway({
  zMin,
  zMax,
  palette,
  lightPadMax = LIGHT_DISTANCE,
}: {
  zMin: number;
  zMax: number;
  palette: Palette;
  lightPadMax?: number; // how far past zMax light images count (0 = nothing spills past the end)
}) {
  const geos = useMemo(() => buildHallwayGeometry(zMin, zMax, lightPadMax), [zMin, zMax, lightPadMax]);
  const cubes = useMemo(() => lattice(zMin, zMax), [zMin, zMax]);
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  return (
    <>
      <mesh geometry={geos.left} material={palette.wallMaterial} />
      <mesh geometry={geos.right} material={palette.wallMaterial} />
      <mesh geometry={geos.floor} material={palette.floorMaterial} />
      <mesh geometry={geos.ceiling} material={palette.wallMaterial} />

      {cubes.map((z) => (
        <mesh key={z} position={[0, CUBE_Y, z]} material={palette.cubeMaterial}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
        </mesh>
      ))}
    </>
  );
}

/** Black cap at the far end of a window so you never see the void behind the last copy. */
function EndCap({ z, dir }: { z: number; dir: 1 | -1 }) {
  return (
    <mesh position={[0, H / 2, z]} rotation={[0, dir === 1 ? 0 : Math.PI, 0]}>
      <planeGeometry args={[W, H]} />
      <meshBasicMaterial color="#000" />
    </mesh>
  );
}
/** Exterior shell + every collider in ONE rigid body. Real hallway only, the copy never gets one. */
function HallwayShell() {
  const gap = SHELL / 2 + 0.01; // keeps the shell off the interior faces (no z-fight)
  const wallH = H + SHELL;
  const wallLen = BUILD + SHELL;

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh position={[-(W / 2 + gap), H / 2, -BUILD  / 2 - 0.105]} castShadow receiveShadow>
        <boxGeometry args={[SHELL, wallH, wallLen]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.9} />
      </mesh>
      <mesh position={[W / 2 + gap, H / 2, -BUILD  / 2 - 0.105]} castShadow receiveShadow>
        <boxGeometry args={[SHELL, wallH, wallLen]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.9} />
      </mesh>
      <mesh position={[0, H + gap, -BUILD  / 2 - 0.105]} castShadow receiveShadow>
        <boxGeometry args={[W + 2 * SHELL + 0.02, SHELL, wallLen]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.9} />
      </mesh>

      {/* Colliders overshoot by PAD at both ends */}
      <CuboidCollider args={[0.5, H / 2, BUILD / 2 + PAD]} position={[-(W / 2 + 0.5), H / 2, -BUILD / 2]} />
      <CuboidCollider args={[0.5, H / 2, BUILD / 2 + PAD]} position={[W / 2 + 0.5, H / 2, -BUILD / 2]} />
      {/* <CuboidCollider args={[W / 2 + 1, 0.5, BUILD / 2 + PAD]} position={[0, -0.5, -BUILD / 2]} /> */}
      <CuboidCollider args={[W / 2 + 1, 0.6, BUILD / 2 + PAD]} position={[0, H + 0.4, -BUILD / 2]} />

      {/* Safety cap behind the exit. The wrap fires first, this only catches a missed frame. */}
      <CuboidCollider args={[W / 2 + 0.5, H / 2, 0.2]} position={[0, H / 2, -BUILD - PAD - 0.2]} />
    </RigidBody>
  );
}

/**
 * Applies the loop translation to the player. Because the copy is the exact
 * inverse translation, WHEN this fires doesn't matter visually as long as it's
 * inside the corridor: any threshold gives the same image.
 */
function LoopWrap({
  origin,
  entranceRef,
}: {
  origin: [number, number, number];
  entranceRef: RefObject<Group | null>;
}) {
  const pending = useRef(false);

  useFrame(() => {
    const store = useGameStore.getState();
    const p = store.playerPosition;
    if (!p) return;

    const lx = p.x - origin[0];
    const ly = p.y - origin[1];
    const lz = p.z - origin[2];

    const inCorridor =
      Math.abs(lx) < W / 2 && ly > -0.5 && ly < H + 0.5 && lz > -BUILD - PAD && lz < PAD;

    // Entrance window is a picture, not a portal: visible while you're inside,
    // hidden at the mouth and outside so the real hallway shows from outside.
    if (entranceRef.current) entranceRef.current.visible = inCorridor && lz < ENTRANCE_HIDE_Z;

    if (!inCorridor) {
      pending.current = false;
      return;
    }

    // The controller applies the teleport on a later tick; don't fire twice meanwhile.
    if (pending.current) {
      if (lz > WRAP_FWD) pending.current = false;
      return;
    }

    if (lz <= WRAP_FWD) {
      pending.current = true;
      store.requestTeleport(new Vector3(p.x, p.y, p.z + LOOP_SHIFT), new Quaternion());
    }
  });

  return null;
}
export function LoopHallway({ position = [8, 0, 0] }: { position?: [number, number, number] }) {
  const palette = useLoopPalette();
  const entranceRef = useRef<Group>(null);

  const exitFar = Z_EXIT_QUAD - GHOST_PERIODS * L;
  const entranceFar = Z_ENTRANCE_QUAD + GHOST_PERIODS * L;

  return (
    <group position={position}>
      <Hallway zMin={-BUILD} zMax={0} palette={palette} lightPadMax={0} />
      <HallwayShell />

      {/* Exit window: the periodic hallway continuing ahead */}
      <Portal
        id="hallway_loop_exit"
        position={[0, H / 2, Z_EXIT_QUAD]}
        width={W + 0.02}
        height={H + 0.02}
        targetPosition={[position[0], position[1] + H / 2, position[2] + Z_ENTRANCE_QUAD]}
        targetRotation={[0, 0, 0]}
        teleport={false}
        blur={0}
        alwaysVisible
      >
        <group position={position}>
          <Hallway zMin={exitFar} zMax={Z_EXIT_QUAD} palette={palette} />
          <EndCap z={exitFar} dir={1} />
        </group>
      </Portal>

      {/* Entrance window: visual only. Always mounted (no hitch), shown/hidden by LoopWrap. */}
      <group ref={entranceRef} visible={false}>
        <Portal
          id="hallway_loop_entrance"
          position={[0, H / 2, Z_ENTRANCE_QUAD]}
          width={W + 0.02}
          height={H + 0.02}
          targetPosition={[position[0], position[1] + H / 2, position[2] + Z_EXIT_QUAD]}
          targetRotation={[0, 0, 0]}
          teleport={false}
          blur={0}
          alwaysVisible
        >
          <group position={position}>
            <Hallway zMin={Z_ENTRANCE_QUAD} zMax={entranceFar} palette={palette} />
            <EndCap z={entranceFar} dir={-1} />
          </group>
        </Portal>
      </group>

      <LoopWrap origin={position} entranceRef={entranceRef} />
    </group>
  );
}