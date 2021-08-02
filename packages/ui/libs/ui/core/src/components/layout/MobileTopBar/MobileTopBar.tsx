import React, { FC, memo } from 'react';
import { AppBar, IconButton, Toolbar, Box } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { TopBarButtonData } from '../TopBar';
import { useStyles } from './MobileTopBar.styles';

export interface MobileTopBarProps {
  onMobileNavOpen: () => void;
  buttons: TopBarButtonData[];
}

export const MobileTopBar: FC<MobileTopBarProps> = memo(
  ({ onMobileNavOpen, buttons }) => {
    const classes = useStyles();
    const allowedButtons = buttons?.filter((button) => button.show);
    return (
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <IconButton onClick={onMobileNavOpen}>
            <Menu />
          </IconButton>
          <Box>
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
