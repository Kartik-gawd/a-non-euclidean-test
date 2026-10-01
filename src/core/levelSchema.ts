export interface LevelData {
  startDimension: number;
  startPosition: [number, number, number];
  rooms: RoomData[];
}

export interface RoomData {
  id: string;
  dimension: number;
  position: [number, number, number];
  geometry: {
    type: 'box';
    position: [number, number, number];
    size: [number, number, number];
    color: string;
    isSolid?: boolean; // Default true
  }[];
  portals: {
    id: string;
    position: [number, number, number];
    rotation?: [number, number, number];
    width: number;
    height: number;
    targetRoomId: string;
    targetDimension?: number;
    targetPosition: [number, number, number];
    targetRotation?: [number, number, number];
  }[];
  gravityVolumes?: {
    position: [number, number, number];
    size: [number, number, number];
    gravityDirection: [number, number, number];
  }[];
}
