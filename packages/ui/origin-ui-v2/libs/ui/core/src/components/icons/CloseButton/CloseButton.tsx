/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { Box, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { FC } from 'react';

export interface CloseButtonProps {
  onClose: () => void;
}

const closeIconCss = css({
  width: 50,
});

export const CloseButton: FC<CloseButtonProps> = ({ onClose }) => {
  return (
    <Box display="flex" justifyContent="flex-end">
      <IconButton css={closeIconCss} color="primary" onClick={onClose}>
        <Close />
      </IconButton>
    </Box>
  );
};
