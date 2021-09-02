import React, { FC } from 'react';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import { CarouselControls, CarouselModeEnum } from '../CarouselControls';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useDeviceImagesCarouselEffects } from './DeviceImagesCarousel.effects';
import { BlockTintedBottom, ImagesCarousel } from '@energyweb/origin-ui-core';
import { useStyles } from './DeviceImagesCarousel.styles';

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
  const classes = useStyles();
  return (
    <ImagesCarousel
      carouselProps={{
        interval: 10000,
        navButtonsAlwaysInvisible: true,
        indicatorContainerProps: {
          className: classes.indicatorContainer,
          style: {},
        },
      }}
    >
      {imageUrls.length > 0 ? (
        imageUrls.map((url) => (
          <BlockTintedBottom key={url}>
            <img src={url} {...itemProps} />
            <CarouselControls
              deviceName={deviceName}
              carouselMode={carouselMode}
              handleModeChange={handleModeChange}
            />
          </BlockTintedBottom>
        ))
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
    </ImagesCarousel>
  );
};
