import React, { FC, memo } from 'react';
import { Box, Button, Toolbar } from '@material-ui/core';
import { useStyles } from './DesktopTopBar.styles';

export type TopBarButtonData = {
  label: string;
  onClick?: () => void;
  show?: boolean;
};

export interface DesktopTopBarProps {
  buttons: TopBarButtonData[];
}

export const DesktopTopBar: FC<DesktopTopBarProps> = memo(({ buttons }) => {
  const classes = useStyles();

  return (
    <Toolbar className={classes.toolbar}>
      <Box flexGrow={1} />
      {buttons
        ?.filter((v) => v.show !== false)
        .map(({ label, onClick }) => (
          <Button className={classes.button} key={label} onClick={onClick}>
            {label}
          </Button>
        ))}
    </Toolbar>
  );
});
