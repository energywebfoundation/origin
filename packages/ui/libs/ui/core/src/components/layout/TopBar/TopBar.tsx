import { Hidden } from '@material-ui/core';
import React, { FC, useCallback } from 'react';
import { DesktopTopBar, TopBarButtonData } from '../DesktopTopBar';
import { MobileTopBar } from '../MobileTopBar';
import { useNavigate } from 'react-router';

export interface TopBarProps {
  isAuthenticated: boolean;
  buttons: TopBarButtonData[];
  onMobileNavOpen: () => void;
}

export const TopBar: FC<TopBarProps> = ({ buttons, onMobileNavOpen }) => {
  const navigate = useNavigate();
  const navigateHandler = useCallback((url: string) => navigate(url), []);
  return (
    <>
      <Hidden lgDown>
        <DesktopTopBar onNavigate={navigateHandler} buttons={buttons} />
      </Hidden>
      <Hidden lgUp>
        <MobileTopBar
          onNavigate={navigateHandler}
          onMobileNavOpen={onMobileNavOpen}
        />
      </Hidden>
    </>
  );
};
