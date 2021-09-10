import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { DevicesInSystemList, DevicesToImportList } from '../../containers';
import { useDeviceImportPageEffects } from './DeviceImportPage.effects';
import { useStyles } from './DeviceImportPage.styles';

export const DeviceImportPage = () => {
  const classes = useStyles();
  const { isLoading, allFuelTypes } = useDeviceImportPageEffects();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.item}>
        <DevicesToImportList allFuelTypes={allFuelTypes} />
      </div>
      <div className={classes.item}>
        <DevicesInSystemList allFuelTypes={allFuelTypes} />
      </div>
    </div>
  );
};
