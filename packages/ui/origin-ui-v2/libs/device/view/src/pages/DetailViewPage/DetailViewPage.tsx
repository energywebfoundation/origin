import { ImagesCarousel } from '@energyweb/origin-ui-core';
import { Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { DetailViewCard, DeviceLocationData } from '../../containers';
import { detailViewMock } from '../../__mocks__/detailViewMock';
import { useStyles } from './DetailViewPage.styles';

export const DetailViewPage: FC = () => {
  const classes = useStyles();
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
      <DeviceLocationData
        owner={detailViewMock.owner}
        location={detailViewMock.location}
        coordinates={detailViewMock.coordinates}
      />
      <DetailViewCard device={detailViewMock} />
      {detailViewMock.projectStory && (
        <Typography my={5}>{detailViewMock.projectStory}</Typography>
      )}
    </div>
  );
};
