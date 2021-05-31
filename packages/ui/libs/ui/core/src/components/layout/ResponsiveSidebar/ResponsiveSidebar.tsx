import React, { FC } from 'react';
import { Drawer, DrawerProps, Hidden } from '@material-ui/core';
import { CloseButton } from '../../icons';

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
      <Hidden mdDown>
        <Drawer open={open} variant="persistent" {...sidebarProps}>
          {handleClose && <CloseButton onClose={handleClose} />}
          {children}
        </Drawer>
      </Hidden>
      <Hidden mdUp>
        <Drawer open={open} variant="temporary" {...sidebarProps}>
          {handleClose && <CloseButton onClose={handleClose} />}
          {children}
        </Drawer>
      </Hidden>
    </>
  );
};
