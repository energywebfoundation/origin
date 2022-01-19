import { Button, ListItem } from '@mui/material';
import clsx from 'clsx';
import React, { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useStyles } from './NavSectionTitle.styles';

export interface NavSectionTitleProps {
  url: string;
  title: string;
  buttonClass?: string;
  dataCy?: string;
}

export const NavSectionTitle: FC<NavSectionTitleProps> = memo(
  ({ url, title, buttonClass, dataCy }) => {
    const classes = useStyles();
    return (
      <ListItem className={classes.listItem} disableGutters>
        <Button
          data-cy={dataCy}
          className={clsx(classes.button, buttonClass)}
          component={NavLink}
          to={url}
        >
          {title}
        </Button>
      </ListItem>
    );
  }
);
