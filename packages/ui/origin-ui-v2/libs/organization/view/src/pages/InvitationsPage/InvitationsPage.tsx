import { TableComponent, TableComponentProps } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';

export const InvitationsPage: FC = () => {
  const mockData: TableComponentProps<number> = {
    header: {
      email: 'Email',
      status: 'Status',
    },
    totalPages: 5,
    data: [
      { id: 2, email: 'testUser@mail.com', status: 'Pending' },
      { id: 25, email: 'realUser@mail.com', status: 'Active' },
      { id: 209, email: 'device@mail.com', status: 'Pending' },
    ],
  };

  return <TableComponent {...mockData} />;
};
