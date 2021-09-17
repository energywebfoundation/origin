import { Paper, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './NoPublicDevices.styles';

export const NoPublicDevices = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const noDeviceTitle = t('device.all.noDeviceTitle');
  const noDeviceDescription1 = t('device.all.noDeviceDescription1');
  const noDeviceDescription2 = t('device.all.noDeviceDescription2');

  return (
    <Paper className={classes.paper}>
      <Typography textAlign="center" variant="h5" marginBottom={3}>
        {noDeviceTitle}
      </Typography>
      <Typography textAlign="center">{noDeviceDescription1}</Typography>
      <Typography textAlign="center">{noDeviceDescription2}</Typography>
    </Paper>
  );
};
