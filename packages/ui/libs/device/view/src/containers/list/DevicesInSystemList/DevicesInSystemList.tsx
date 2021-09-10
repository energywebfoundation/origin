import React, { FC } from 'react';
import { GenericItemsList } from '@energyweb/origin-ui-core';
import { useDevicesInSystemListEffects } from './DevicesInSystemList.effects';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { CircularProgress } from '@material-ui/core';

export interface DevicesInSystemListProps {
  allFuelTypes: CodeNameDTO[];
}

export const DevicesInSystemList: FC<DevicesInSystemListProps> = ({
  allFuelTypes,
}) => {
  const { listItems, isLoading, listTitle } = useDevicesInSystemListEffects(
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
