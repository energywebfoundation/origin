/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { Box, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { FC } from 'react';
import { useComponentStyles } from './styles';

export interface CloseButtonProps {
  onClose: () => void;
}

export const CloseButton: FC<CloseButtonProps> = ({ onClose }) => {
  const { closeIconCss } = useComponentStyles();
  return (
    <Box display="flex" justifyContent="flex-end">
      <IconButton css={closeIconCss} color="primary" onClick={onClose}>
        <Close />
      </IconButton>
    </Box>
  );
};
