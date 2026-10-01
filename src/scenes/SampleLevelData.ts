import type { LevelData } from '../core/levelSchema';

export const sampleLevel: LevelData = {
  startDimension: 0,
  startPosition: [0, 2, 5],
  rooms: [
    {
      id: 'room_a',
      dimension: 0,
      position: [-20, 0, 0],
      geometry: [
        { type: 'box', position: [0, -0.5, 0], size: [10, 1, 10], color: '#445566' }, // Floor
        { type: 'box', position: [0, 5, 0], size: [10, 1, 10], color: '#222' },      // Ceiling
        { type: 'box', position: [-5, 2.5, 0], size: [1, 5, 10], color: '#664455' }, // Wall L
        { type: 'box', position: [5, 2.5, 0], size: [1, 5, 10], color: '#664455' },  // Wall R
        { type: 'box', position: [0, 2.5, -5], size: [10, 5, 1], color: '#556644' }, // Wall F
        { type: 'box', position: [0, 2.5, 5], size: [10, 5, 1], color: '#556644' },  // Wall B
      ],
      portals: [
        {
          id: 'portal_a_to_b',
          position: [0, 1.5, -4.9], // On front wall
          width: 2,
          height: 3,
          targetRoomId: 'room_b',
          targetDimension: 2,
          targetPosition: [-20, 1.5, 4.9], // Inside Room B, facing back
        }
      ],
    },
    {
      id: 'room_b',
      dimension: 2,
      position: [-20, 0, 0], // Overlapping physically, but in dimension 2
      geometry: [
        { type: 'box', position: [0, -0.5, 0], size: [10, 1, 10], color: '#aa3333' }, // Red Floor
        { type: 'box', position: [-5, 2.5, 0], size: [1, 5, 10], color: '#222' }, // Wall L
        { type: 'box', position: [5, 2.5, 0], size: [1, 5, 10], color: '#222' },  // Wall R
        { type: 'box', position: [0, 2.5, -5], size: [10, 5, 1], color: '#222' }, // Wall F
        { type: 'box', position: [0, 2.5, 5], size: [10, 5, 1], color: '#222' },  // Wall B
      ],
      portals: [
        {
          id: 'portal_b_to_a',
          position: [0, 1.5, 4.9], // On back wall
          rotation: [0, Math.PI, 0],
          width: 2,
          height: 3,
          targetRoomId: 'room_a',
          targetDimension: 0,
          targetPosition: [-20, 1.5, -4.9], // Inside Room A, facing back
          targetRotation: [0, Math.PI, 0],
        }
      ],
      gravityVolumes: [
        {
          position: [0, 2.5, -2],
          size: [5, 5, 5],
          gravityDirection: [0, 0, 1], // Pulls you to the wall!
        }
      ]
    }
  ]
};
