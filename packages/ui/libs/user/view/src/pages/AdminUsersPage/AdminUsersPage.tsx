import React, { FC } from 'react';

import { TableComponent } from '@energyweb/origin-ui-core';
import { useAdminUsersPageEffects } from './AdminUsersPage.effects';

export const AdminUsersPage: FC = () => {
  const tableProps = useAdminUsersPageEffects();

  return <TableComponent {...tableProps} />;
};
