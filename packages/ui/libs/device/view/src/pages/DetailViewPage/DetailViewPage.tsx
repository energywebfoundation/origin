import React, { FC } from 'react';

import { ImagesCarousel } from '@energyweb/origin-ui-core';
import { CircularProgress, Typography } from '@material-ui/core';

import { DetailViewCard, DeviceLocationData } from '../../containers';
import { detailViewMock } from '../../__mocks__/detailViewMock';
import { useDetailViewPageEffects } from './DetailViewPage.effects';
import { useStyles } from './DetailViewPage.styles';
import { SmartMeterBlock } from '../../containers/smartMeter/SmartMeterBlock';

export const DetailViewPage: FC = () => {
  const classes = useStyles();
  const { locationProps, cardProps, device, isLoading } =
    useDetailViewPageEffects();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <div className={classes.wrapper}>
      <ImagesCarousel
        items={detailViewMock.images}
        carouselProps={{
          interval: 10000,
          navButtonsAlwaysInvisible: true,
          indicatorContainerProps: {
            className: classes.indicatorContainer,
            style: {},
          },
        }}
        itemProps={{ className: classes.images }}
      >
        <Typography className={classes.deviceName}>
          {detailViewMock.name}
        </Typography>
      </ImagesCarousel>
      <DeviceLocationData {...locationProps} />
      <DetailViewCard {...cardProps} />

      {device.notes && <Typography my={5}>{device.notes}</Typography>}

      <SmartMeterBlock device={device} />
    </div>
  );
};
