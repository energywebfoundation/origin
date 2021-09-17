import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { useMyTradesPageEffects } from './MyTradesPage.effects';

export const MyTradesPage: FC = () => {
  const {
    tableData,
    canAccessPage,
    requirementsProps,
  } = useMyTradesPageEffects();

  if (!canAccessPage) {
    return <Requirements {...requirementsProps} />;
  }

  return <TableComponent {...tableData} />;
};
