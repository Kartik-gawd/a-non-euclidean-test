import { Text, useTexture } from '@react-three/drei';
import { CuboidCollider } from '@react-three/rapier';
import { Dimension, RigidBody } from '../../core/Dimension';
import { Portal } from './Portal';

function CastleInterior() {
  const imageTexture = useTexture('/images/meme.png');

  return (
    <>
      <ambientLight intensity={0.3} color="#4433aa" />
      <pointLight position={[0, 8, 0]} intensity={3} color="#aa8833" distance={30} />
      <pointLight position={[10, 4, 10]} intensity={1.5} color="#3388aa" distance={20} />
      <pointLight position={[-10, 4, -10]} intensity={1.5} color="#aa3355" distance={20} />

      <RigidBody type="fixed" position={[0, -0.05, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[60, 0.1, 60]} />
          <meshStandardMaterial color="#1a1225" roughness={0.9} />
        </mesh>
      </RigidBody>

      <mesh position={[0, 20, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0d0a18" side={2} />
      </mesh>

     

      <mesh position={[0, 0.01, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#3a2a55" roughness={0.4} metalness={0.1} />
      </mesh>

      <mesh position={[0, 14, -26.8]}>
        <planeGeometry args={[8, 5]} />
        <meshBasicMaterial
          map={imageTexture}
          transparent
        />
      </mesh>
      <Text
        position={[0, 18, -27]}
        fontSize={1.2}
        color="#ccaa44"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        P KA BHOSDA ITNA BADAA
      </Text>

      <Portal
        id="tardis_exit"
        position={[0, 1.5, 0.5]}
        rotation={[0, Math.PI, 0]}
        width={1.0}
        height={2.8}
        targetPosition={[0, 1.5, -11]}
        targetRotation={[0, 0, 0]}
        targetDimension={0}
      >
        <meshBasicMaterial color="#000" />
      </Portal>
    </>
  );
}

function BoothExterior() {
  const color = '#1a3a8a';
  return (
    <>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1.4, 3, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      <mesh position={[0, 3.15, 0]}>
        <boxGeometry args={[1.6, 0.3, 1.6]} />
        <meshStandardMaterial color="#152d6e" roughness={0.5} />
      </mesh>

      <mesh position={[0, 3.45, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color="#d4aa30" metalness={0.8} roughness={0.2} emissive="#d4aa30" emissiveIntensity={0.4} />
      </mesh>

      {[[-0.6, 1.5], [0.6, 1.5]].map(([x, y], i) =>
        [[-0.6, 0.5], [0.6, 0.5]].map(([z, _], j) => (
          <mesh key={`${i}-${j}`} position={[x * 0.6, y, z * 0.6]}>
            <boxGeometry args={[0.02, 2.8, 0.02]} />
            <meshStandardMaterial color="#d4aa30" metalness={0.9} roughness={0.1} />
          </mesh>
        ))
      )}

      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[1.45, 0.05, 1.45]} />
        <meshStandardMaterial color="#d4aa30" metalness={0.6} roughness={0.3} emissive="#d4aa30" emissiveIntensity={0.2} />
      </mesh>
    </>
  );
}

export function TardisEffect({ position = [0, 0, -12] as [number, number, number] }) {
  return (
    <group position={position}>
      <BoothExterior />

      <Portal
        id="tardis_entrance"
        position={[0, 1.5, 0.71]}
        width={1.0}
        height={2.8}
        targetPosition={[0, 1001.5, 12]}
        targetRotation={[0, 0, 0]}
        targetDimension={1}
      >
        <Dimension id={1}>
          <CastleInterior />
        </Dimension>
      </Portal>

      <RigidBody type="fixed" position={[0, 1.5, 0]}>
        <CuboidCollider args={[0.7, 1.5, 0.7]} />
      </RigidBody>

      <pointLight position={[0, 3.5, 0]} intensity={0.5} color="#8866ff" distance={3} />
      
      {/* 
        This is the ACTUAL physical CastleInterior in the main world.
        We place it 1000m in the sky so it doesn't overlap with Layer 0 geometry.
        The one inside the Portal above is purely visual for the doorway illusion.
      */}
      <group position={[0, 1000, 12]}>
        <Dimension id={1}>
          <CastleInterior />
        </Dimension>
      </group>
    </group>
  );
}
