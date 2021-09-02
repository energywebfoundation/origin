import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import React, { FC } from 'react';
import { CarouselModeEnum } from '../CarouselControls';
import { DeviceImagesCarousel } from '../DeviceImagesCarousel';
import { DeviceMapCarousel } from '../DeviceMapCarousel';
import { useDetailViewCarouselEffects } from './DetailViewCarousel.effects';
import { useStyles } from './DetailViewCarousel.styles';

interface DetailViewCarouselProps {
  device: ComposedPublicDevice;
  allFuelTypes: CodeNameDTO[];
}

export const DetailViewCarousel: FC<DetailViewCarouselProps> = ({
  device,
  allFuelTypes,
}) => {
  const { carouselMode, handleModeChange } = useDetailViewCarouselEffects();
  const classes = useStyles();
  return (
    <>
      {carouselMode === CarouselModeEnum.Photo ? (
        <DeviceImagesCarousel
          deviceName={device.name}
          imageIds={device.imageIds}
          fuelType={device.fuelType}
          allFuelTypes={allFuelTypes}
          carouselMode={carouselMode}
          handleModeChange={handleModeChange}
          itemProps={{ className: classes.item }}
        />
      ) : (
        <DeviceMapCarousel
          device={device}
          carouselMode={carouselMode}
          handleModeChange={handleModeChange}
          itemProps={{ className: classes.item }}
        />
      )}
    </>
  );
};
