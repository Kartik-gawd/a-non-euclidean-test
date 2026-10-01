import { RigidBody } from '@react-three/rapier';

export function Obby({ position = [-15, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Stairs */}
      <RigidBody type="fixed" position={[0, 0.25, 0]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial color="#ffaa00" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 0.75, -2]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial color="#ffaa00" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 1.25, -4]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial color="#ffaa00" />
        </mesh>
      </RigidBody>

      {/* Tiny Stepping Stones */}
      <RigidBody type="fixed" position={[0, 1.5, -7]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.5, 0.8]} />
          <meshStandardMaterial color="#00aaff" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[1.5, 1.75, -9]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.5, 0.8]} />
          <meshStandardMaterial color="#00aaff" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-1.5, 2.0, -11]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.5, 0.8]} />
          <meshStandardMaterial color="#00aaff" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 2.25, -14]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshStandardMaterial color="#00aaff" />
        </mesh>
      </RigidBody>

      {/* Wall Hugging */}
      <RigidBody type="fixed" position={[0, 3, -18]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[5, 4, 0.3]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-2, 2.5, -17]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 0.2, 0.5]} />
          <meshStandardMaterial color="#ff00aa" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[2, 3, -17]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 0.2, 0.5]} />
          <meshStandardMaterial color="#ff00aa" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-3.5, 3.5, -19]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 0.2, 0.5]} />
          <meshStandardMaterial color="#ff00aa" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 4, -19.5]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshStandardMaterial color="#00ffaa" />
        </mesh>
      </RigidBody>

      {/* Blind Jumps */}
      <RigidBody type="fixed" position={[0, 4.5, -23]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#ffaa00" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 5.0, -26]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#ffaa00" />
        </mesh>
      </RigidBody>
      
      {/* Moving Platforms are hard to sync perfectly without complex math in useFrame, so we do tricky spacing instead */}
      <RigidBody type="fixed" position={[3, 5.5, -29]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.5, 0.8]} />
          <meshStandardMaterial color="#ff5555" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-3, 6.0, -32]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.5, 0.8]} />
          <meshStandardMaterial color="#ff5555" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 6.5, -35]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshStandardMaterial color="#ff5555" />
        </mesh>
      </RigidBody>

      {/* Goal Platform */}
      <RigidBody type="fixed" position={[0, 6.5, -40]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <boxGeometry args={[4, 0.5, 4]} />
          <meshStandardMaterial color="#00ffaa" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 8, -40]} colliders="cuboid">
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[0.5, 0.5, 2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffaa" emissiveIntensity={0.5} />
        </mesh>
      </RigidBody>
    </group>
  );
}
