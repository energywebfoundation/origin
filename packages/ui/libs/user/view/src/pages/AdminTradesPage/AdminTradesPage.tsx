import { TableComponent } from '@energyweb/origin-ui-core';
import React from 'react';
import { useAdminTradesPageEffects } from './AdminTradesPage.effects';

export const AdminTradesPage = () => {
  const tableProps = useAdminTradesPageEffects();

  return <TableComponent {...tableProps} />;
};
