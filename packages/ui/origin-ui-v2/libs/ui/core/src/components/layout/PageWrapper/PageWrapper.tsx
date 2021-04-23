import React from 'react';
import { useStyles } from './PageWrapper.styles';

export const PageWrapper = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.wrapper}>{children}</div>;
};
