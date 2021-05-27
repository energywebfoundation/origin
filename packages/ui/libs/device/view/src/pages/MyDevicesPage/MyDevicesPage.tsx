import React, { FC } from 'react';
import { Grid } from '@material-ui/core';
import { myDevicesMock } from '../../__mocks__/myDevicesMock';
import { useStyles } from './MyDevicesPage.styles';
import { MyDeviceCard } from '../../containers';
import { useMyDevicePageEffects } from './MyDevicesPage.effects';

export const MyDevicesPage: FC = () => {
  const classes = useStyles();
  const { selected, handleSelect } = useMyDevicePageEffects();

  return (
    <Grid container className={classes.wrapper}>
      {myDevicesMock.map((device) => (
        <MyDeviceCard
          key={device.id}
          selected={selected === device.id}
          onClick={() => handleSelect(device.id)}
          device={device}
        />
      ))}
    </Grid>
  );
};
