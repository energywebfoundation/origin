import { LinearProgress } from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './ProgressLine.styles';

export const ProgressLine: FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <LinearProgress className={classes.line} />
    </div>
  );
};
