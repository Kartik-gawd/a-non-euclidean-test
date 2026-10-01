import React from 'react';
import type { LevelData, RoomData } from './levelSchema';
import { Dimension, RigidBody } from './Dimension';
import { Portal } from '../components/interactables/Portal';
import { GravityVolume } from '../components/interactables/GravityVolume';
import { GhostRenderer } from '../components/interactables/GhostRenderer';

const MAX_RECURSION_DEPTH = 2;

interface RoomRendererProps {
  room: RoomData;
  level: LevelData;
  depth: number;
  renderPhysics?: boolean;
}

function RoomRenderer({ room, level, depth, renderPhysics = true }: RoomRendererProps) {
  const targetLayer = depth === 0 ? room.dimension : 0;
  
  return (
    <LayerSetter layer={targetLayer}>
      <group position={room.position}>
        <GhostRenderer dimension={room.dimension} />
      
      {/* Geometry */}
      {room.geometry.map((geom, idx) => {
        const isSolid = geom.isSolid !== false;
        const mesh = (
          <mesh position={geom.position}>
            <boxGeometry args={geom.size} />
            <meshStandardMaterial color={geom.color} roughness={0.8} />
          </mesh>
        );

        if (isSolid && renderPhysics) {
          return (
            <RigidBody key={`geom-${idx}`} type="fixed" position={geom.position}>
              {mesh}
            </RigidBody>
          );
        }
        return <React.Fragment key={`geom-${idx}`}>{mesh}</React.Fragment>;
      })}

      {/* Gravity Volumes */}
      {renderPhysics && room.gravityVolumes?.map((gv, idx) => (
        <GravityVolume
          key={`gv-${idx}`}
          position={gv.position}
          size={gv.size}
          gravityDirection={gv.gravityDirection}
        />
      ))}

      {/* Portals */}
      {room.portals.map((portal) => {
        const targetRoom = level.rooms.find((r) => r.id === portal.targetRoomId);
        if (!targetRoom) return null;

        return (
          <Portal
            key={portal.id}
            id={portal.id}
            position={portal.position}
            rotation={portal.rotation}
            width={portal.width}
            height={portal.height}
            targetPosition={portal.targetPosition}
            targetRotation={portal.targetRotation}
            targetDimension={targetRoom.dimension}
          >
            {depth < MAX_RECURSION_DEPTH ? (
              <Dimension id={targetRoom.dimension}>
                <RoomRenderer room={targetRoom} level={level} depth={depth + 1} renderPhysics={false} />
              </Dimension>
            ) : (
              <color attach="background" args={['#000']} />
            )}
          </Portal>
        );
      })}
      </group>
    </LayerSetter>
  );
}

function LayerSetter({ layer, children }: { layer: number, children: React.ReactNode }) {
  const groupRef = React.useRef<any>(null);
  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.layers.set(layer);
        }
      });
    }
  }, [layer]);
  return <group ref={groupRef}>{children}</group>;
}

export function LevelLoader({ data }: { data: LevelData }) {
  return (
    <group>
      {data.rooms.map((room) => {
        return (
          <Dimension key={room.id} id={room.dimension}>
            <RoomRenderer room={room} level={data} depth={0} />
          </Dimension>
        );
      })}
    </group>
  );
}
