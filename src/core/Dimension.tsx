import React, { createContext, useContext, forwardRef } from 'react';
import { RigidBody as RapierRigidBody, interactionGroups } from '@react-three/rapier';
import type { RigidBodyProps } from '@react-three/rapier';

export const DimensionContext = createContext<number>(0);

export function Dimension({ id, children }: { id: number; children: React.ReactNode }) {
  return <DimensionContext.Provider value={id}>{children}</DimensionContext.Provider>;
}

export function useDimension() {
  return useContext(DimensionContext);
}

export const RigidBody = forwardRef<any, RigidBodyProps & { dimension?: number }>((props, ref) => {
  const contextDim = useDimension();
  const dim = props.dimension ?? contextDim;
  
  // interactionGroups takes a membership mask and a filter mask
  // We use `dim` as the bit index (0 to 15).
  // Objects in this dimension get membership `dim` and collide with `dim`.
  const defaultGroups = interactionGroups(dim, [dim]);
  const collisionGroups = props.collisionGroups ?? defaultGroups;

  // Pass down all props except dimension
  const { dimension, ...rest } = props;

  return <RapierRigidBody ref={ref} {...rest} collisionGroups={collisionGroups} />;
});
