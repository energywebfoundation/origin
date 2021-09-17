import { Button, Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useStyles } from './PageNotFound.styles';

export const PageNotFound: FC = () => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Typography textAlign="center" variant="h4">
        Page you are trying to access is not existing
      </Typography>
      <Button
        color="primary"
        variant="contained"
        className={classes.button}
        component={NavLink}
        to={'/'}
      >
        Go back
      </Button>
    </Paper>
  );
};
