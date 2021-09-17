import React from 'react';
import { Paper, Typography, Button, Box } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import { useStyles } from './NoDevicesOwnedCard.styles';
import { useTranslation } from 'react-i18next';

export const NoDevicesOwnedCard = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const noDeviceTitle = t('device.my.noDeviceTitle');
  const noDeviceDescription = t('device.my.noDeviceDescription');
  const registerButtonText = t('device.my.registerDevice');
  const importButtonText = t('device.my.importDevice');

  return (
    <Paper className={classes.paper}>
      <Typography textAlign="center" variant="h6">
        {noDeviceTitle}
      </Typography>
      <Typography textAlign="center">{noDeviceDescription}</Typography>
      <Box width="100%" display="flex" justifyContent="center">
        <Button
          color="primary"
          variant="contained"
          className={classes.button}
          component={NavLink}
          to={'/device/register'}
        >
          {registerButtonText}
        </Button>
        <Button
          color="primary"
          variant="contained"
          className={classes.button}
          component={NavLink}
          to={'/device/import'}
        >
          {importButtonText}
        </Button>
      </Box>
    </Paper>
  );
};
