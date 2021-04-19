import React from 'react';
import { Box, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
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
