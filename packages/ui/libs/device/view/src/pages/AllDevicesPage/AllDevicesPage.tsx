import React, { FC } from 'react';
import { CircularProgress, Grid } from '@material-ui/core';
import { PublicDeviceCard } from '../../containers';
import { useStyles } from './AllDevicesPage.styles';
import { useAllDevicesPageEffects } from './AllDevicesPage.effects';

export const AllDevicesPage: FC = () => {
  const { allDevices, allDeviceTypes, isLoading } = useAllDevicesPageEffects();
  const classes = useStyles();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid container spacing={3} className={classes.wrapper}>
      {allDevices.map((device) => (
        <Grid key={`device-${device.id}`} item>
          <PublicDeviceCard device={device} allDeviceTypes={allDeviceTypes} />
        </Grid>
      ))}
    </Grid>
  );
};
