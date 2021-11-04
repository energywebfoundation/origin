import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { Button, Box, Typography, useMediaQuery, Paper } from '@mui/material';
import { useTheme } from '@mui/styles';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import React from 'react';
import { injectedConnector } from '../../connectors';
import { useStyles } from './ConnectMetamask.styles';

export const ConnectMetamask = () => {
  const { activate } = useWeb3React();
  const classes = useStyles();

  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('md'));

  const handleInstall = () => {
    window.location.replace('https://metamask.io/');
  };
  const handleConnect = async () => {
    await activate(injectedConnector, undefined, true).catch((error) => {
      if (error instanceof UnsupportedChainIdError) {
        showNotification(
          `You are connected to the unsupported network`,
          NotificationTypeEnum.Error
        );
      } else {
        showNotification(
          `Unknown error while connecting wallet. Please reload the page`,
          NotificationTypeEnum.Error
        );
      }
    });
  };

  const noMetamaskInstalled = !(
    (window as any).web3 || (window as any).ethereum
  );
  const clickHandler = noMetamaskInstalled ? handleInstall : handleConnect;
  const buttonText = noMetamaskInstalled
    ? 'Install Metamask'
    : 'Connect Metamask';

  return (
    <Paper className={classes.paper}>
      <Box mb={2}>
        <Typography variant="h5" component="span">
          This block requires Metamask to be installed and connected
        </Typography>
      </Box>
      <Box>
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
