import { Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './ListItemHeader.styles';

export interface ListItemHeaderProps {
  name: string;
  country: string;
}

export const ListItemHeader: FC<ListItemHeaderProps> = ({ name, country }) => {
  const classes = useStyles();
  return (
    <div className={classes.header}>
      <Typography>{name || ''}</Typography>
      <Typography>{country || ''}</Typography>
    </div>
  );
};
