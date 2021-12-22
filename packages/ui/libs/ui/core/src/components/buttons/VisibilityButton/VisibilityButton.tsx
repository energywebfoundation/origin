import { IconButton } from '@mui/material';
import React, { FC } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface VisibilityButtonProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

export const VisibilityButton: FC<VisibilityButtonProps> = ({
  visible,
  setVisible,
}) => {
  return (
    <IconButton onClick={() => setVisible(!visible)}>
      {visible ? <VisibilityOff /> : <Visibility />}
    </IconButton>
  );
};
