import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { CardWithImage } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import React, { FC } from 'react';
import { PublicDeviceCardContent } from '../PublicDeviceCardContent';
import { usePublicDeviceCardEffects } from './PublicDeviceCard.effects';
import { useStyles } from './PublicDeviceCard.styles';

export interface PublicDeviceCardProps {
  device: ComposedPublicDevice;
  allDeviceTypes: CodeNameDTO[];
}

export const PublicDeviceCard: FC<PublicDeviceCardProps> = ({
  device,
  allDeviceTypes,
}) => {
  const { specsData, iconsData, cardProps } = usePublicDeviceCardEffects({
    device,
    allDeviceTypes,
  });

  const classes = useStyles();

  return (
    <CardWithImage
      {...cardProps}
      fallbackIconProps={{ className: classes.icon }}
      cardProps={{ className: classes.card }}
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
