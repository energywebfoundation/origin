import React, { FC, memo } from 'react';
import { ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { Box, Button, SwitchProps, Toolbar } from '@mui/material';
import clsx from 'clsx';
import { TopBarButtonData } from '../TopBar';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useStyles } from './DesktopTopBar.styles';

type DesktopTopbarButton = Omit<TopBarButtonData, 'Icon'>;

export interface DesktopTopBarProps {
  buttons: DesktopTopbarButton[];
  toolbarClassName?: string;
  themeSwitcher?: boolean;
  themeMode?: ThemeModeEnum;
  changeThemeMode?: () => void;
  themeSwitchProps?: Omit<SwitchProps, 'checked' | 'onChange'>;
}

export const DesktopTopBar: FC<DesktopTopBarProps> = memo(
  ({
    buttons,
    toolbarClassName,
    themeSwitcher = false,
    themeMode = ThemeModeEnum.Light,
    changeThemeMode,
    themeSwitchProps,
  }) => {
    const classes = useStyles();
    return (
      <Toolbar className={clsx(classes.toolbar, toolbarClassName)}>
        <Box flexGrow={1} />
        {themeSwitcher && (
          <ThemeSwitcher
            selected={themeMode === ThemeModeEnum.Light}
            handleThemeChange={changeThemeMode}
            switchProps={themeSwitchProps}
          />
        )}
        {buttons
          ?.filter((v) => v.show !== false)
          .map(({ label, onClick, dataCy }) => (
            <Button
              className={classes.button}
              key={label}
              onClick={onClick}
              data-cy={dataCy}
            >
              {label}
            </Button>
          ))}
      </Toolbar>
    );
  }
);

DesktopTopBar.displayName = 'DesktopTopBar';
