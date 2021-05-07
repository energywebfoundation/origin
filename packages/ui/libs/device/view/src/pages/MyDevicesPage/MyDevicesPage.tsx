import React, { FC } from 'react';
import { Grid } from '@material-ui/core';
import { myDevicesMock } from '../../__mocks__/myDevicesMock';
import { DeviceCard } from '../../containers';
import { useStyles } from './MyDevicesPage.styles';

export const MyDevicesPage: FC = () => {
  const classes = useStyles();

  return (
    <Grid container spacing={3} className={classes.wrapper}>
      {myDevicesMock.map((device) => (
        <Grid key={`my-device-${device.id}`} item>
          <DeviceCard device={device} />
        </Grid>
      ))}
    </Grid>
  );
};
