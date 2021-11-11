import React from 'react';
import { CircularProgress, Paper } from '@mui/material';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useEditDevicePageEffects } from './EditDevicePage.effects';
import { useStyles } from './EditDevicePage.styles';

export const EditDevicePage = () => {
  const classes = useStyles();
  const { isLoading, formConfig } = useEditDevicePageEffects();

  if (isLoading) return <CircularProgress />;

  return (
    <Paper className={classes.paper}>
      <GenericForm {...formConfig} />
    </Paper>
  );
};
