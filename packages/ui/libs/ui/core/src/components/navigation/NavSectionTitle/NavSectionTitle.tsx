import { Button, ListItem } from '@material-ui/core';
import React, { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useStyles } from './NavSectionTitle.styles';

export interface NavSectionTitleProps {
  url: string;
  title: string;
}

export const NavSectionTitle: FC<NavSectionTitleProps> = memo(
  ({ url, title }) => {
    const classes = useStyles();
    return (
      <ListItem className={classes.listItem} disableGutters>
        <Button className={classes.button} component={NavLink} to={url}>
          {title}
        </Button>
      </ListItem>
    );
  }
);
