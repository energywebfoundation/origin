import { Button, ListItem } from '@material-ui/core';
import React, { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useStyles } from './MenuItem.styles';

export interface MenuItemProps {
  label: string;
  url: string;
  closeMobileNav?: () => void;
}

export const MenuItem: FC<MenuItemProps> = memo(
  ({ label, url, closeMobileNav, ...props }) => {
    const classes = useStyles();
    return (
      <ListItem className={classes.listItem} {...props}>
        <Button
          onClick={closeMobileNav}
          className={classes.button}
          component={NavLink}
          to={url}
        >
          {label}
        </Button>
      </ListItem>
    );
  }
);
