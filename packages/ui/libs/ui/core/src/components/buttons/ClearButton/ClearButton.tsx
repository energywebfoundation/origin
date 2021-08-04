import React, { FC } from 'react';
import { IconButton, IconButtonProps } from '@material-ui/core';
import { Clear } from '@material-ui/icons';

export const ClearButton: FC<IconButtonProps> = (props) => {
  return (
    <IconButton {...props}>
      <Clear />
    </IconButton>
  );
};
