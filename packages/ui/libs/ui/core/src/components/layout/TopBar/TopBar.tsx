import { Box, SwitchProps } from '@mui/material';
import { ThemeModeEnum } from '@energyweb/origin-ui-theme';
import React, { FC } from 'react';
import { DesktopTopBar } from '../DesktopTopBar';
import { MobileTopBar } from '../MobileTopBar';

export type TopBarButtonData = {
  label: string;
  Icon: FC;
  onClick: () => void;
  show: boolean;
  dataCy?: string;
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
  toolbarClassName = '',
  themeSwitcher = false,
  themeMode = ThemeModeEnum.Light,
  changeThemeMode,
  themeSwitchProps,
}) => {
  return (
    <>
      <Box sx={{ display: { lg: 'block', xs: 'none' } }}>
        <DesktopTopBar
          buttons={buttons}
          toolbarClassName={toolbarClassName}
          themeSwitcher={themeSwitcher}
          themeMode={themeMode}
          changeThemeMode={changeThemeMode}
          themeSwitchProps={themeSwitchProps}
        />
      </Box>
      <Box sx={{ display: { lg: 'none', xs: 'block' } }}>
        <MobileTopBar
          buttons={buttons}
          onMobileNavOpen={onMobileNavOpen}
          toolbarClassName={toolbarClassName}
          themeSwitcher={themeSwitcher}
          themeMode={themeMode}
          changeThemeMode={changeThemeMode}
          themeSwitchProps={themeSwitchProps}
        />
      </Box>
    </>
  );
};
