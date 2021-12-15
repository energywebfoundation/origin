import React, { ReactNode } from 'react';
import { useStyles } from './PageWrapper.styles';

export interface PageWrapperProps {
  children: ReactNode;
}

export const PageWrapper = ({ children }: PageWrapperProps) => {
  const classes = useStyles();

  return <div className={classes.wrapper}>{children}</div>;
};
