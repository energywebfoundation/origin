import React, { FC } from 'react';
import { GenericItemsList } from '@energyweb/origin-ui-core';
import { useDevicesToImportListEffects } from './DeviceToImportList.effects';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { CircularProgress } from '@material-ui/core';

export interface DevicesToImportListProps {
  allFuelTypes: CodeNameDTO[];
}

export const DevicesToImportList: FC<DevicesToImportListProps> = ({
  allFuelTypes,
}) => {
  const { listItems, listTitle, isLoading } = useDevicesToImportListEffects(
    allFuelTypes
  );

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <GenericItemsList
      listTitle={listTitle}
      titleProps={{ variant: 'h6' }}
      listContainers={listItems}
      pagination
      pageSize={3}
    />
  );
};
