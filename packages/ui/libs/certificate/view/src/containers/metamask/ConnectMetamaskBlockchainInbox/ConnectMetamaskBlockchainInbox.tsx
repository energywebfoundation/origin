import React from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { useConnectMetamaskPlaceHolderEffects } from './ConnectMetamaskBlockchainInbox.effects';
import { useStyles } from './ConnectMetamaskBlockchainInbox.styles';

export const ConnectMetamaskBlockchainInbox = () => {
  const classes = useStyles();
  const { mobileView, title, clickHandler, buttonText } =
    useConnectMetamaskPlaceHolderEffects();

  return (
    <Paper className={classes.paper}>
      <Box className={classes.titleWrapper}>
        <Typography variant="h5" component="span" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Box className={classes.buttonWrapper}>
        <Button
          fullWidth={false}
          color="primary"
          variant="contained"
          onClick={clickHandler}
          disabled={mobileView}
        >
          {buttonText}
        </Button>
      </Box>
    </Paper>
  );
};
