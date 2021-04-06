import { Hidden } from '@material-ui/core';
import React, { FC } from 'react';
import {
  DesktopTopBar,
  MobileTopBar,
  TopBarButtonData,
} from '../../components';

export interface TopBarProps {
  buttons: TopBarButtonData[];
  onMobileNavOpen: () => void;
}

export const TopBar: FC<TopBarProps> = ({ buttons, onMobileNavOpen }) => {
  return (
    <>
      <Hidden xsDown>
        <DesktopTopBar buttons={buttons} />
      </Hidden>
      <Hidden mdUp>
        <MobileTopBar onMobileNavOpen={onMobileNavOpen} />
      </Hidden>
    </>
  );
};
