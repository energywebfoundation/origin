import React, { FC } from 'react';
import { Grid } from '@material-ui/core';
import { allDevicesMock } from '../../__mocks__/allDeviceMock';
import { DeviceCard } from '../../containers';
import { useStyles } from './AllDevicesPage.styles';
// import { useAllDevicesPageEffects } from './AllDevicesPage.effects';

export const AllDevicesPage: FC = () => {
  const classes = useStyles();
  // const { allDevices } = useAllDevicesPageEffects();

  // console.log(allDevices);

  // if (allDevices.length === 0) {
  //   return <></>;
  // }

  return (
    <Grid container spacing={3} className={classes.wrapper}>
      {allDevicesMock.map((device) => (
        <Grid key={`device-${device.id}`} item>
          <DeviceCard device={device} />
        </Grid>
      ))}
    </Grid>
  );
};
