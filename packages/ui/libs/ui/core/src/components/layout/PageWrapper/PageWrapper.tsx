import React from 'react';
import { useStyles } from './PageWrapper.styles';

export const PageWrapper: React.FC = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.wrapper}>{children}</div>;
};
