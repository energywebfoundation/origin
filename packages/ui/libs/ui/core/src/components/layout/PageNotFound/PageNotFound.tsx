import { Button, Paper, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useStyles } from './PageNotFound.styles';

export const PageNotFound: FC = () => {
  const classes = useStyles();
  const handleBack = () => window.history.back();

  return (
    <Paper className={classes.paper}>
      <Typography textAlign="center" variant="h4" component="span">
        Page you are trying to access is not existing
      </Typography>
      <Button
        color="primary"
        variant="contained"
        className={classes.button}
        onClick={handleBack}
      >
        Go back
      </Button>
    </Paper>
  );
};
