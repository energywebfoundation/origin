import { TableComponent } from '@energyweb/origin-ui-core';
import React from 'react';
import { useAllOrganizationsPageEffects } from './AllOrganizationsPage.effects';

export const AllOrganizationsPage = () => {
  const tableProps = useAllOrganizationsPageEffects();

  return <TableComponent {...tableProps} />;
};
