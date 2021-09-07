import React, { FC, memo } from 'react';
import {
  AppBar,
  IconButton,
  Toolbar,
  Box,
  SwitchProps,
} from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import clsx from 'clsx';
import { ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { ThemeSwitcher } from '@energyweb/origin-ui-core';
import { useStyles } from './MobileTopBar.styles';
import { TopBarButtonData } from '../TopBar';

export interface MobileTopBarProps {
  onMobileNavOpen: () => void;
  buttons: TopBarButtonData[];
  toolbarClassName?: string;
  themeSwitcher?: boolean;
  themeMode?: ThemeModeEnum;
  changeThemeMode?: () => void;
  themeSwitchProps?: Omit<SwitchProps, 'checked' | 'onChange'>;
}

export const MobileTopBar: FC<MobileTopBarProps> = memo(
  ({
    onMobileNavOpen,
    buttons,
    toolbarClassName,
    themeSwitcher,
    themeMode,
    changeThemeMode,
    themeSwitchProps,
  }) => {
    const classes = useStyles();
    const allowedButtons = buttons?.filter((button) => button.show);
    return (
      <AppBar>
        <Toolbar className={clsx(classes.toolbar, toolbarClassName)}>
          <IconButton onClick={onMobileNavOpen}>
            <Menu />
          </IconButton>
          <Box>
            {themeSwitcher && (
              <ThemeSwitcher
                selected={themeMode === ThemeModeEnum.Light}
                handleThemeChange={changeThemeMode}
                switchProps={themeSwitchProps}
              />
            )}
            {allowedButtons?.map((button) => {
              const { Icon, onClick, label } = button;
              return (
                <IconButton
                  key={`mobile-topbar-button-${label}`}
                  onClick={onClick}
                >
                  <Icon />
                </IconButton>
              );
            })}
          </Box>
        </Toolbar>
      </AppBar>
    );
  }
);
