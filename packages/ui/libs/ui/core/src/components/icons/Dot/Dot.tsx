import React, { FC } from 'react';

export interface DotProps {
  backgroundColor?: string;
  width?: string;
  height?: string;
  margin?: string;
  borderRadius?: string;
}

export const Dot: FC<DotProps> = ({
  backgroundColor = 'rgb(255,215,0)',
  width = '12px',
  height = '12px',
  borderRadius = '50%',
  margin = '0 0 0 4px',
}) => (
  <span
    style={{
      display: 'inline-block',
      backgroundColor,
      width,
      height,
      borderRadius,
      margin,
    }}
  />
);
