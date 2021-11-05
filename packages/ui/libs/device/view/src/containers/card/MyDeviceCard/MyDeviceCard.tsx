import React from 'react';

import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { HorizontalCard } from '@energyweb/origin-ui-core';
import { ComposedDevice } from '@energyweb/origin-ui-device-data';

import { MyDeviceCardHeader } from '../MyDeviceCardHeader';
import { MyDeviceCardContent } from '../MyDeviceCardContent';

import { useMyDeviceCardEffects } from './MyDeviceCard.effects';
import { useStyles } from './MyDeviceCard.styles';

export interface MyDeviceCardProps {
  selected: boolean;
  onClick: () => void;
  device: ComposedDevice;
  allDeviceTypes: CodeNameDTO[];
}

export const MyDeviceCard: React.FC<MyDeviceCardProps> = ({
  device,
  allDeviceTypes,
  selected,
  onClick,
}) => {
  const { imageUrl, fallbackIcon, cardHeaderProps, cardContentProps } =
    useMyDeviceCardEffects(device, allDeviceTypes);
  const classes = useStyles();

  return (
    <HorizontalCard
      selected={selected}
      onClick={onClick}
      imageUrl={imageUrl}
      fallbackIcon={fallbackIcon}
      fallbackIconProps={{ className: classes.fallbackIcon }}
      fallbackIconWrapperProps={{ className: classes.fallbackIconWrapper }}
      header={<MyDeviceCardHeader {...cardHeaderProps} />}
      content={
        <MyDeviceCardContent deviceId={device.id} {...cardContentProps} />
      }
    />
  );
};
