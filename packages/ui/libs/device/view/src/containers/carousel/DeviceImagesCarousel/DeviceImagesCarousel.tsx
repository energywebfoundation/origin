import React, { FC } from 'react';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { BlockTintedBottom, ImagesCarousel } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import { CarouselControls, CarouselModeEnum } from '../CarouselControls';
import { useDeviceImagesCarouselEffects } from './DeviceImagesCarousel.effects';

export interface DeviceImagesCarouselProps {
  deviceName: ComposedPublicDevice['name'];
  imageIds: ComposedPublicDevice['imageIds'];
  allFuelTypes: CodeNameDTO[];
  fuelType: ComposedPublicDevice['fuelType'];
  itemProps: React.SVGAttributes<HTMLOrSVGElement>;
  carouselMode: CarouselModeEnum;
  handleModeChange: (
    event: React.MouseEvent<HTMLElement>,
    mode: CarouselModeEnum
  ) => void;
}

export const DeviceImagesCarousel: FC<DeviceImagesCarouselProps> = ({
  deviceName,
  imageIds,
  fuelType,
  allFuelTypes,
  itemProps,
  carouselMode,
  handleModeChange,
}) => {
  const { FallbackIcon, imageUrls } = useDeviceImagesCarouselEffects(
    imageIds,
    fuelType,
    allFuelTypes
  );
  return (
    <>
      {imageUrls.length > 0 ? (
        <BlockTintedBottom>
          <ImagesCarousel images={imageUrls} imagesProps={itemProps} />
          <CarouselControls
            deviceName={deviceName}
            carouselMode={carouselMode}
            handleModeChange={handleModeChange}
          />
        </BlockTintedBottom>
      ) : (
        <BlockTintedBottom>
          <FallbackIcon {...itemProps} />
          <CarouselControls
            deviceName={deviceName}
            carouselMode={carouselMode}
            handleModeChange={handleModeChange}
          />
        </BlockTintedBottom>
      )}
    </>
  );
};
