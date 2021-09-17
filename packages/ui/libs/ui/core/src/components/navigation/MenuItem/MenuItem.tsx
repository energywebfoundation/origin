import { Button, ListItem } from '@material-ui/core';
import clsx from 'clsx';
import React, { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useStyles } from './MenuItem.styles';

export interface MenuItemProps {
  label: string;
  url: string;
  selected: boolean;
  closeMobileNav?: () => void;
  selectedClass?: string;
  buttonClass?: string;
}

export const MenuItem: FC<MenuItemProps> = memo(
  ({ label, url, selected, closeMobileNav, selectedClass, buttonClass }) => {
    const classes = useStyles();
    return (
      <ListItem
        className={`${classes.listItem} ${
          selected && (selectedClass || classes.selected)
        }`}
      >
        <Button
          onClick={closeMobileNav}
          className={clsx(classes.button, buttonClass)}
          component={NavLink}
          to={url}
        >
          {label}
        </Button>
      </ListItem>
    );
  }
);
