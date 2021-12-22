import React, { FC } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import { Clear } from '@mui/icons-material';

export const ClearButton: FC<IconButtonProps> = (props) => {
  return (
    <IconButton {...props}>
      <Clear />
    </IconButton>
  );
};
