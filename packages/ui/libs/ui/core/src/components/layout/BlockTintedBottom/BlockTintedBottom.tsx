import React, { ReactNode } from 'react';
import { useStyles } from './BlockTintedBottom.styles';

export interface BlockTintedBottomProps {
  children: ReactNode;
  height?: number;
}

export const BlockTintedBottom = ({
  children,
  height = 150,
}: BlockTintedBottomProps) => {
  const classes = useStyles(height);

  return (
    <div className={classes.wrapper}>
      {children}
      <div className={classes.tintedBottom}></div>
    </div>
  );
};
