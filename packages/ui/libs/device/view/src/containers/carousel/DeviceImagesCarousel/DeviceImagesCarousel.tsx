import React, { FC } from 'react';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import { CarouselControls, CarouselModeEnum } from '../CarouselControls';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useDeviceImagesCarouselEffects } from './DeviceImagesCarousel.effects';

export interface DeviceImagesCarouselProps {
  deviceName: ComposedPublicDevice['name'];
  images: ComposedPublicDevice['imageIds'];
  allFuelTypes: CodeNameDTO[];
  fuelType: ComposedPublicDevice['fuelType'];
  itemProps: React.ImgHTMLAttributes<HTMLImageElement>;
  carouselMode: CarouselModeEnum;
  handleModeChange: (
    event: React.MouseEvent<HTMLElement>,
    mode: CarouselModeEnum
  ) => void;
}

export const DeviceImagesCarousel: FC<DeviceImagesCarouselProps> = ({
  deviceName,
  images,
  fuelType,
  allFuelTypes,
  itemProps,
  carouselMode,
  handleModeChange,
}) => {
  const FallbackIcon = useDeviceImagesCarouselEffects(fuelType, allFuelTypes);

  return (
    <>
      {false ? (
        <img src={images[0]} {...itemProps} />
      ) : (
        <FallbackIcon {...itemProps} />
      )}
      <CarouselControls
        deviceName={deviceName}
        carouselMode={carouselMode}
        handleModeChange={handleModeChange}
      />
    </>
  );
};
