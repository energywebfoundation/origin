import { Box } from '@material-ui/core';
import React, { FC } from 'react';
import { DesktopTopBar } from '../DesktopTopBar';
import { MobileTopBar } from '../MobileTopBar';

export type TopBarButtonData = {
  label: string;
  Icon: FC<any>;
  onClick: () => void;
  show: boolean;
};

export interface TopBarProps {
  isAuthenticated: boolean;
  buttons: TopBarButtonData[];
  onMobileNavOpen: () => void;
}

export const TopBar: FC<TopBarProps> = ({ buttons, onMobileNavOpen }) => {
  return (
    <>
      <Box sx={{ display: { lg: 'block', xs: 'none' } }}>
        <DesktopTopBar buttons={buttons} />
      </Box>
      <Box sx={{ display: { lg: 'none', xs: 'block' } }}>
        <MobileTopBar buttons={buttons} onMobileNavOpen={onMobileNavOpen} />
      </Box>
    </>
  );
};
