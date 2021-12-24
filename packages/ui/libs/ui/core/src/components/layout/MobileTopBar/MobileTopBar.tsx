import React, { FC, memo } from 'react';
import { AppBar, IconButton, Toolbar, Box, SwitchProps } from '@mui/material';
import { Menu } from '@mui/icons-material';
import clsx from 'clsx';
import { ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useStyles } from './MobileTopBar.styles';
import { TopBarButtonData } from '../TopBar';

export interface MobileTopBarProps {
  buttons: TopBarButtonData[];
  onMobileNavOpen: () => void;
  toolbarClassName?: string;
  themeSwitcher?: boolean;
  themeMode?: ThemeModeEnum;
  changeThemeMode?: () => void;
  themeSwitchProps?: Omit<SwitchProps, 'checked' | 'onChange'>;
}

export const MobileTopBar: FC<MobileTopBarProps> = memo(
  ({
    buttons,
    onMobileNavOpen,
    toolbarClassName,
    themeSwitcher = false,
    themeMode = ThemeModeEnum.Light,
    changeThemeMode = () => {},
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
              const { Icon, onClick, label, dataCy } = button;
              return (
                <IconButton
                  data-cy={dataCy}
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
