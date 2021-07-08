import React, { FC } from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { useClaimsReportPageEffects } from './ClaimsReportPage.effects';

export const ClaimsReportPage: FC = () => {
  const { tableData } = useClaimsReportPageEffects();

  return <TableComponent {...tableData} />;
};
