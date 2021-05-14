import React, { FC, memo } from 'react';
import { AppBar, IconButton, Toolbar } from '@material-ui/core';
import { Menu } from '@material-ui/icons';

export interface MobileTopBarProps {
  onMobileNavOpen: () => void;
  onNavigate: (url: string) => void;
}

export const MobileTopBar: FC<MobileTopBarProps> = memo(
  ({ onMobileNavOpen }) => {
    return (
      <AppBar>
        <Toolbar>
          <IconButton onClick={onMobileNavOpen}>
            <Menu />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }
);
