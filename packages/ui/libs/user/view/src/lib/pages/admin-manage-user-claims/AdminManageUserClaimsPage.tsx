import React from 'react';
import { TableComponent, TableRowData } from '@energyweb/origin-ui-core';
import { useAdminManageUserClaimsPageEffects } from './AdminManageUserClaimsPage.effects';

interface IAdminManageUserClaimsTableRowDataConfig
  extends TableRowData<number> {
  certificateId: string;
  deviceName: string;
  energy: string;
  beneficiary: string;
  fromDate: string;
  toDate: string;
}
/* eslint-disable-next-line */
export interface AdminManageUserClaimsProps {}

export const AdminManageUserClaimsPage = () => {
  useAdminManageUserClaimsPageEffects();

  const columns: Omit<IAdminManageUserClaimsTableRowDataConfig, 'id'> = {
    certificateId: 'certificate.claims.certificateId',
    deviceName: 'certificate.claims.deviceName',
    energy: 'certificate.claims.energy',
    beneficiary: 'certificate.claims.beneficiary',
    fromDate: 'certificate.claims.fromDate',
    toDate: 'certificate.claims.toDate',
  };
  return <TableComponent loading={true} data={[]} header={columns} />;
};

export default AdminManageUserClaimsPage;
