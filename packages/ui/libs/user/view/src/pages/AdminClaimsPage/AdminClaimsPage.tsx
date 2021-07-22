import { TableComponent } from '@energyweb/origin-ui-core';
import React from 'react';
import { useAdminClaimsPageEffects } from './AdminClaimsPage.effects';

export const AdminClaimsPage = () => {
  const tableProps = useAdminClaimsPageEffects();

  return <TableComponent {...tableProps} />;
};
