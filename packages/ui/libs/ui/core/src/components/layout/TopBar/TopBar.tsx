import { Box, SwitchProps } from '@material-ui/core';
import { ThemeModeEnum } from '@energyweb/origin-ui-theme';
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
  buttons: TopBarButtonData[];
  onMobileNavOpen: () => void;
  toolbarClassName?: string;
  themeSwitcher?: boolean;
  themeMode?: ThemeModeEnum;
  changeThemeMode?: () => void;
  themeSwitchProps?: Omit<SwitchProps, 'checked' | 'onChange'>;
}

export const TopBar: FC<TopBarProps> = ({
  buttons,
  onMobileNavOpen,
  ...themeSwitchProps
}) => {
  return (
    <>
      <Box sx={{ display: { lg: 'block', xs: 'none' } }}>
        <DesktopTopBar buttons={buttons} {...themeSwitchProps} />
      </Box>
      <Box sx={{ display: { lg: 'none', xs: 'block' } }}>
        <MobileTopBar
          buttons={buttons}
          onMobileNavOpen={onMobileNavOpen}
          {...themeSwitchProps}
        />
      </Box>
    </>
  );
};
