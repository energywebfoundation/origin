import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { useClaimsReportPageEffects } from './ClaimsReportPage.effects';

export const ClaimsReportPage: FC = () => {
  const { tableData, canAccessPage } = useClaimsReportPageEffects();

  if (!canAccessPage) {
    return <Requirements />;
  }

  return <TableComponent {...tableData} />;
};
