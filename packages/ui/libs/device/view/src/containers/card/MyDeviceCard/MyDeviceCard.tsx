import { HorizontalCard } from '@energyweb/origin-ui-core';
import { Typography } from '@material-ui/core';
import React from 'react';

export interface MyDeviceCardProps {
  selected: boolean;
  onClick: () => void;
  device: any;
}

export const MyDeviceCard: React.FC<MyDeviceCardProps> = ({
  device,
  selected,
  onClick,
}) => {
  return (
    <HorizontalCard
      selected={selected}
      onClick={onClick}
      header={<Typography>{device.name}</Typography>}
      content={<Typography>{device.deviceType}</Typography>}
      imageUrl={device.imageUrl}
    />
  );
};
