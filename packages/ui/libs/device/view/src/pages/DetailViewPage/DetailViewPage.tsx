import React, { FC } from 'react';

import { CircularProgress, Typography } from '@material-ui/core';

import {
  DetailViewCard,
  DetailViewCarousel,
  DeviceLocationData,
  SmartMeterBlock,
} from '../../containers';
import { useDetailViewPageEffects } from './DetailViewPage.effects';
import { useStyles } from './DetailViewPage.styles';

export const DetailViewPage: FC = () => {
  const classes = useStyles();
  const { locationProps, cardProps, device, isLoading, allTypes } =
    useDetailViewPageEffects();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <div className={classes.wrapper}>
      <DetailViewCarousel device={device} allFuelTypes={allTypes} />

      <DeviceLocationData {...locationProps} />

      <DetailViewCard {...cardProps} />

      {device.notes && <Typography my={5}>{device.notes}</Typography>}

      <SmartMeterBlock device={device} />
    </div>
  );
};
