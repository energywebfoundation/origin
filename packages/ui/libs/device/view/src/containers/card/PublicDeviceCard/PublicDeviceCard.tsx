import { CardWithImage } from '@energyweb/origin-ui-core';
// import {
//   ComposedPublicDevice,
//   ComposedDevice,
// } from '@energyweb/origin-ui-device-data';
import React, { FC } from 'react';
import { PublicDeviceCardContent } from '../PublicDeviceCardContent';
import { usePublicDeviceCardEffects } from './PublicDeviceCard.effects';
import { useStyles } from './PublicDeviceCard.styles';

export interface PublicDeviceCardProps {
  device: any; //ComposedPublicDevice | ComposedDevice;
}

export const PublicDeviceCard: FC<PublicDeviceCardProps> = ({ device }) => {
  const { specsData, iconsData, hoverText } = usePublicDeviceCardEffects({
    device,
  });
  const classes = useStyles();
  return (
    <CardWithImage
      heading={device.facilityName}
      hoverText={hoverText}
      imageUrl={device.images}
      fallbackIcon={iconsData[0].icon}
      fallbackIconProps={{ className: classes.icon }}
      content={
        <PublicDeviceCardContent
          id={device.id}
          specsData={specsData}
          iconsData={iconsData}
        />
      }
    />
  );
};
