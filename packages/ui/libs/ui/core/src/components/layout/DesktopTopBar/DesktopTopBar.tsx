import React, { FC, memo } from 'react';
import { Box, Button, SwitchProps, Toolbar } from '@material-ui/core';
import { useStyles } from './DesktopTopBar.styles';
import { TopBarButtonData } from '../TopBar';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import clsx from 'clsx';

export interface DesktopTopBarProps {
  buttons: TopBarButtonData[];
  toolbarClassName?: string;
  themeSwitcher?: boolean;
  themeMode?: 'dark' | 'light';
  changeThemeMode?: () => void;
  themeSwitchProps?: Omit<SwitchProps, 'checked' | 'onChange'>;
}

export const DesktopTopBar: FC<DesktopTopBarProps> = memo(
  ({
    buttons,
    toolbarClassName,
    themeSwitcher = false,
    themeMode,
    changeThemeMode,
    themeSwitchProps,
  }) => {
    const classes = useStyles();
    return (
      <Toolbar className={clsx(classes.toolbar, toolbarClassName)}>
        <Box flexGrow={1} />
        {themeSwitcher && (
          <ThemeSwitcher
            selected={themeMode === 'light'}
            handleThemeChange={changeThemeMode}
            switchProps={themeSwitchProps}
          />
        )}
        {buttons
          ?.filter((v) => v.show !== false)
          .map(({ label, onClick }) => (
            <Button className={classes.button} key={label} onClick={onClick}>
              {label}
            </Button>
          ))}
      </Toolbar>
    );
  }
);
