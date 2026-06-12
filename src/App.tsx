import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";

export default function App() {
  return (
    <Canvas>
      <Physics>

        <RigidBody type="fixed">
          <mesh position={[0, -1, 0]}>
            <boxGeometry args={[10, 1, 10]} />
            <meshStandardMaterial color="green" />
          </mesh>
        </RigidBody>

        <RigidBody>
          <mesh position={[0, 3, 0]}>
            <boxGeometry />
            <meshStandardMaterial color="orange" />
          </mesh>
        </RigidBody>

      </Physics>
    </Canvas>
  );
}