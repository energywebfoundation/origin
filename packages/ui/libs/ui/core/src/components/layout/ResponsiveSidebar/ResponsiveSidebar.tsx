import React, { FC } from 'react';
import { Drawer, DrawerProps, Box } from '@material-ui/core';
import { CloseButton } from '../../buttons';

export interface ResponsiveSidebarProps {
  open: boolean;
  handleClose?: () => void;
  sidebarProps?: Omit<DrawerProps, 'open' | 'variant'>;
}

export const ResponsiveSidebar: FC<ResponsiveSidebarProps> = ({
  open,
  handleClose,
  children,
  sidebarProps,
}) => {
  return (
    <>
      <Box sx={{ display: { lg: 'block', xs: 'none' } }}>
        <Drawer open={open} variant="persistent" {...sidebarProps}>
          {handleClose && <CloseButton onClose={handleClose} />}
          {children}
        </Drawer>
      </Box>
      <Box sx={{ display: { lg: 'none', xs: 'block' } }}>
        <Drawer open={open} variant="temporary" {...sidebarProps}>
          {handleClose && <CloseButton onClose={handleClose} />}
          {children}
        </Drawer>
      </Box>
    </>
  );
};
