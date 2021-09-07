import { GenericMap } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';
import React, { FC } from 'react';
import { CarouselControls, CarouselModeEnum } from '../CarouselControls';
import { useCertificateAppEnv } from '../../../context';

interface DeviceMapCarouselProps {
  device: ComposedPublicDevice;
  carouselMode: CarouselModeEnum;
  handleModeChange: (
    event: React.MouseEvent<HTMLElement>,
    mode: CarouselModeEnum
  ) => void;
  itemProps: React.HTMLAttributes<HTMLDivElement>;
  mapContainerClassName?: string;
}

export const DeviceMapCarousel: FC<DeviceMapCarouselProps> = ({
  device,
  itemProps,
  carouselMode,
  handleModeChange,
  mapContainerClassName,
}) => {
  const { googleMapsApiKey } = useCertificateAppEnv();
  return (
    <div {...itemProps}>
      <GenericMap
        apiKey={googleMapsApiKey}
        allItems={[device]}
        containerClassName={mapContainerClassName}
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
