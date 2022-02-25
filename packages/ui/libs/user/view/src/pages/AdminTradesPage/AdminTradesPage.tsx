import React from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { useAdminTradesPageEffects } from './AdminTradesPage.effects';

export const AdminTradesPage = () => {
  const tableProps = useAdminTradesPageEffects();
  return <TableComponent {...tableProps} />;
};

export default AdminTradesPage;
