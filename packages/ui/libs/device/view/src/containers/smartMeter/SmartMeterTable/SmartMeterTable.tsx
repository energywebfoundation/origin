import React, { FC } from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import { useSmartMeterTableEffects } from './SmartMeterTable.effects';

interface SmartMeterTableProps {
  device: ComposedPublicDevice;
}

export const SmartMeterTable: FC<SmartMeterTableProps> = ({ device }) => {
  const tableProps = useSmartMeterTableEffects(device);
  return <TableComponent {...tableProps} />;
};
