import { Button, ListItem } from '@mui/material';
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
  dataCy?: string;
}

export const MenuItem: FC<MenuItemProps> = memo(
  ({
    label,
    url,
    dataCy,
    selected = false,
    closeMobileNav,
    selectedClass,
    buttonClass,
  }) => {
    const classes = useStyles();
    return (
      <ListItem
        className={`${classes.listItem} ${
          selected && (selectedClass || classes.selected)
        }`}
      >
        <Button
          data-cy={dataCy}
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
