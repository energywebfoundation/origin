import React, { FC } from 'react';
import { CircularProgress } from '@material-ui/core';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { GenericItemsList } from '@energyweb/origin-ui-core';
import { useCertificatesToImportListEffects } from './CertificatesToImportList.effects';

export interface DevicesToImportListProps {
  allFuelTypes: CodeNameDTO[];
}

export const CertificatesToImportList: FC<DevicesToImportListProps> = ({
  allFuelTypes,
}) => {
  const { listItems, listTitle, isLoading } =
    useCertificatesToImportListEffects(allFuelTypes);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <GenericItemsList
      listTitle={listTitle}
      titleProps={{ variant: 'h6' }}
      listContainers={listItems}
      pagination
      pageSize={5}
    />
  );
};
