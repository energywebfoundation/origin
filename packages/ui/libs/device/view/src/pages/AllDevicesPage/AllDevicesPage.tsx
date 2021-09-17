import React, { FC } from 'react';
import { CircularProgress, Grid } from '@material-ui/core';
import { NoPublicDevices, PublicDeviceCard } from '../../containers';
import { useStyles } from './AllDevicesPage.styles';
import { useAllDevicesPageEffects } from './AllDevicesPage.effects';

export const AllDevicesPage: FC = () => {
  const {
    allActiveDevices,
    allDeviceTypes,
    isLoading,
  } = useAllDevicesPageEffects();
  const classes = useStyles();

  if (isLoading) {
    return <CircularProgress />;
  }

  if (allActiveDevices.length === 0) {
    return <NoPublicDevices />;
  }

  return (
    <Grid container spacing={3} className={classes.wrapper}>
      {allActiveDevices.map((device) => (
        <Grid key={`device-${device.id}`} item>
          <PublicDeviceCard device={device} allDeviceTypes={allDeviceTypes} />
        </Grid>
      ))}
    </Grid>
  );
};
