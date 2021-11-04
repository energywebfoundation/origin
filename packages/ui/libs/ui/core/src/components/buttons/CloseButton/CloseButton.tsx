import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { FC } from 'react';
import { useStyles } from './CloseButton.styles';

export interface CloseButtonProps {
  onClose: () => void;
}

export const CloseButton: FC<CloseButtonProps> = ({ onClose }) => {
  const classes = useStyles();
  return (
    <Box display="flex" justifyContent="flex-end">
      <IconButton
        className={classes.closeIcon}
        color="primary"
        onClick={onClose}
      >
        <Close />
      </IconButton>
    </Box>
  );
};
