import { CardWithImage } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { DeviceCardContent } from '../DeviceCardContent';
import { useDeviceCardEffects } from './DeviceCard.effects';
import { useStyles } from './DeviceCard.styles';

export interface DeviceCardProps {
  device: any;
}

export const DeviceCard: FC<DeviceCardProps> = ({ device }) => {
  const { specsData, iconsData, hoverText } = useDeviceCardEffects({ device });
  const classes = useStyles();
  return (
    <CardWithImage
      heading={device.name}
      hoverText={hoverText}
      imageUrl={device.imageUrl}
      fallbackIcon={iconsData[0].icon}
      fallbackIconProps={{ className: classes.icon }}
      content={
        <DeviceCardContent
          id={device.id}
          specsData={specsData}
          iconsData={iconsData}
        />
      }
    />
  );
};
