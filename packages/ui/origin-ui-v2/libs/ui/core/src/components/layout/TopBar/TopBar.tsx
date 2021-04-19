import { Hidden } from '@material-ui/core';
import React, { FC } from 'react';
import { DesktopTopBar, TopBarButtonData } from '../DesktopTopBar';
import { MobileTopBar } from '../MobileTopBar';

export interface TopBarProps {
  buttons: TopBarButtonData[];
  onMobileNavOpen: () => void;
}

export const TopBar: FC<TopBarProps> = ({ buttons, onMobileNavOpen }) => {
  return (
    <>
      <Hidden lgDown>
        <DesktopTopBar buttons={buttons} />
      </Hidden>
      <Hidden lgUp>
        <MobileTopBar onMobileNavOpen={onMobileNavOpen} />
      </Hidden>
    </>
  );
};
