import { BlockTintedBottom, GenericMap } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import React, { FC } from 'react';
import { useDeviceAppEnv } from '../../../context';
import { CarouselControls, CarouselModeEnum } from '../CarouselControls';
import { useStyles } from './DeviceMapCarousel.styles';

interface DeviceMapCarouselProps {
  device: ComposedPublicDevice;
  carouselMode: CarouselModeEnum;
  handleModeChange: (
    event: React.MouseEvent<HTMLElement>,
    mode: CarouselModeEnum
  ) => void;
  itemProps: React.HTMLAttributes<HTMLDivElement>;
}

export const DeviceMapCarousel: FC<DeviceMapCarouselProps> = ({
  device,
  itemProps,
  carouselMode,
  handleModeChange,
}) => {
  const classes = useStyles();
  const { googleMapsApiKey } = useDeviceAppEnv();
  return (
    <BlockTintedBottom height={70}>
      <div {...itemProps}>
        <GenericMap
          apiKey={googleMapsApiKey}
          allItems={[device]}
          containerClassName={classes.mapContainer}
          mapProps={{
            options: {
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
            },
          }}
        />
        <CarouselControls
          deviceName={device.name}
          carouselMode={carouselMode}
          handleModeChange={handleModeChange}
        />
      </div>
    </BlockTintedBottom>
  );
};
