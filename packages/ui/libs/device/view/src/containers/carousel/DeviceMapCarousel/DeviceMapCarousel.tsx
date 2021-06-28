import { GenericMap } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import React, { FC } from 'react';
import { CarouselControls, CarouselModeEnum } from '../CarouselControls';

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
  return (
    <div {...itemProps}>
      <GenericMap
        apiKey={process.env.NX_GOOGLE_MAPS_API_KEY}
        allItems={[device]}
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
  );
};
