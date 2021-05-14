import React from 'react';

import { TableComponent, TableRowData } from '@energyweb/origin-ui-core';
import { UserDTO } from '@energyweb/origin-backend-client';
import { useAdminManageUsersPageEffects } from './AdminManageUsersPage.effects';

/* eslint-disable-next-line */
export interface AdminManageUsersPageProps {
  handleSetEditUserData: (userDto: UserDTO) => void;
}

interface IAdminManageUsersTableRowDataConfig extends TableRowData<number> {
  firstName: string;
  organization: string;
  email: string;
  status: string;
  kycStatus: string;
}

export const AdminManageUsersPage = ({
  handleSetEditUserData,
}: AdminManageUsersPageProps) => {
  const { data, isLoading } = useAdminManageUsersPageEffects(
    handleSetEditUserData
  );

  const columns: {
    [k in keyof Omit<IAdminManageUsersTableRowDataConfig, 'id'>];
  } = {
    firstName: 'user.properties.firstName',
    organization: 'user.properties.organization',
    email: 'user.properties.email',
    status: 'user.properties.status',
    kycStatus: 'user.properties.kycStatus',
  };

  return (
    <TableComponent
      loading={isLoading}
      data={data?.map(mapDataToTableRows)}
      header={columns}
    />
  );
};

const mapDataToTableRows = (el): IAdminManageUsersTableRowDataConfig => ({
  id: el.id,
  email: el.email,
  organization: el.organization.name,
  firstName: el.firstName,
  status: el.status,
  kycStatus: el.kycStatus,
  actions: [{ name: 'update', icon: 'edit', onClick: () => {} }],
});

export default AdminManageUsersPage;
