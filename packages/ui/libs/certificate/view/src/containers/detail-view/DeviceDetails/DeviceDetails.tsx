import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';
import { CircularProgress } from '@material-ui/core';
import React, { FC } from 'react';

import { DetailViewCarousel } from '../../carousel';
import { DeviceDetailCard } from '../DeviceDetailCard';
import { DeviceLocationData } from '../DeviceLocationData';

import { useDetailViewPageEffects } from './DeviceDetails.effects';
import { useStyles } from './DeviceDetails.styles';

export interface DeviceDetailsProps {
  device: ComposedPublicDevice;
}

export const DeviceDetails: FC<DeviceDetailsProps> = ({ device }) => {
  const classes = useStyles();
  const { locationProps, cardProps, isLoading, allTypes } =
    useDetailViewPageEffects(device);

  if (isLoading) return <CircularProgress />;

  return (
    <div className={classes.wrapper}>
      <DetailViewCarousel device={device} allFuelTypes={allTypes} />
      <DeviceLocationData {...locationProps} />
      <DeviceDetailCard deviceId={device.id} {...cardProps} />
    </div>
  );
};
