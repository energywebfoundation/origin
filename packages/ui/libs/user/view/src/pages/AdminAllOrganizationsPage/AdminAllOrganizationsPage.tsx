import { TableComponent } from '@energyweb/origin-ui-core';
import React from 'react';
import { useAdminAllOrganizationsPageEffects } from './AdminAllOrganizationsPage.effects';

export const AdminAllOrganizationsPage = () => {
  const tableProps = useAdminAllOrganizationsPageEffects();

  return <TableComponent {...tableProps} />;
};

export default AdminAllOrganizationsPage;
