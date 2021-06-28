import React, { FC } from 'react';
import { useStyles } from './BlockTintedBottom.styles';

export interface BlockTintedBottomProps {
  height?: number;
}

export const BlockTintedBottom: FC<BlockTintedBottomProps> = ({
  children,
  height,
}) => {
  const classes = useStyles(height);
  return (
    <div className={classes.wrapper}>
      {children}
      <div className={classes.tintedBottom}></div>
    </div>
  );
};
