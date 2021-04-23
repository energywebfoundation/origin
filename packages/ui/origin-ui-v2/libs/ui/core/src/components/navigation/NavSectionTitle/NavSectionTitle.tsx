import { Button, ListItem } from '@material-ui/core';
import React, { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useStyles } from './NavSection.styles';

export interface NavSectionTitleProps {
  url: string;
  title: string;
  clickHandler?: () => void;
}

export const NavSectionTitle: FC<NavSectionTitleProps> = memo(
  ({ url, title, clickHandler }) => {
    const classes = useStyles();
    return (
      <ListItem className={classes.listItem} disableGutters>
        <Button
          onClick={clickHandler}
          className={classes.button}
          component={NavLink}
          to={url}
        >
          {title}
        </Button>
      </ListItem>
    );
  }
);
