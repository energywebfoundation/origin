import React from 'react';
import { TableComponent, TableRowData } from '@energyweb/origin-ui-core';

interface IAdminManageUserClaimsTableRowDataConfig
  extends TableRowData<number> {
  certificateId: string;
  deviceName: string;
  energy: string;
  beneficiary: string;
  fromDate: string;
  toDate: string;
}

export const AdminClaimsPage = () => {
  return <>claims page</>;
};
