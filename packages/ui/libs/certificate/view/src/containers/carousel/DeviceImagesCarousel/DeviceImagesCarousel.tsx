import React, { FC } from 'react';
import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';
import { CarouselControls, CarouselModeEnum } from '../CarouselControls';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useDeviceImagesCarouselEffects } from './DeviceImagesCarousel.effects';
import { BlockTintedBottom, ImagesCarousel } from '@energyweb/origin-ui-core';

export interface DeviceImagesCarouselProps {
  deviceName: ComposedPublicDevice['name'];
  images: ComposedPublicDevice['imageIds'];
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
  images,
  fuelType,
  allFuelTypes,
  itemProps,
  carouselMode,
  handleModeChange,
}) => {
  const { FallbackIcon, imageUrls } = useDeviceImagesCarouselEffects(
    fuelType,
    allFuelTypes,
    images
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
