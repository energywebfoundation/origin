import React, { FC } from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { useApprovedPageEffects } from './ApprovedPage.effects';

export const ApprovedPage: FC = () => {
  const { tableData } = useApprovedPageEffects();

  return <TableComponent {...tableData} />;
};
