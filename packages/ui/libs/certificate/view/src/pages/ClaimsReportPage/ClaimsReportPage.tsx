import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { useClaimsReportPageEffects } from './ClaimsReportPage.effects';

export const ClaimsReportPage: FC = () => {
  const { tableData, permissions } = useClaimsReportPageEffects();

  if (!permissions.canAccessPage) {
    return <Requirements {...permissions} />;
  }

  return <TableComponent {...tableData} />;
};
