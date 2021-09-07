import React, { FC, memo } from 'react';
import {
  AppBar,
  IconButton,
  Toolbar,
  Box,
  SwitchProps,
} from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { TopBarButtonData } from '../TopBar';
import { useStyles } from './MobileTopBar.styles';
import { ThemeSwitcher } from '@energyweb/origin-ui-core';
import clsx from 'clsx';

export interface MobileTopBarProps {
  onMobileNavOpen: () => void;
  buttons: TopBarButtonData[];
  toolbarClassName?: string;
  themeSwitcher?: boolean;
  themeMode?: 'dark' | 'light';
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
                selected={themeMode === 'light'}
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
