import React, { FC, memo } from 'react';
import { Box, Button, Toolbar } from '@material-ui/core';
import { useStyles } from './DesktopTopBar.styles';

export type TopBarButtonData = {
  label: string;
  onClick?: () => void;
  url?: string;
  show?: boolean;
};

export interface DesktopTopBarProps {
  buttons: TopBarButtonData[];
  onNavigate?: (url: string) => void;
}

export const DesktopTopBar: FC<DesktopTopBarProps> = memo(
  ({ buttons, onNavigate }) => {
    const classes = useStyles();

    return (
      <Toolbar className={classes.toolbar}>
        <Box flexGrow={1} />
        {buttons
          ?.filter((v) => v.show !== false)
          .map(({ url, label, onClick }) => (
            <Button
              className={classes.button}
              key={label}
              onClick={() => {
                onClick && onClick();
                url && onNavigate && onNavigate(url);
              }}
            >
              {label}
            </Button>
          ))}
      </Toolbar>
    );
  }
);
