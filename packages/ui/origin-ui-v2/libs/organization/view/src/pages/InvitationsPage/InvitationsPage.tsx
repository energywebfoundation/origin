import { TableComponent } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';

export const InvitationsPage: FC = () => {
  const mockData = {
    header: {
      email: 'Email',
      status: 'Status',
    },
    data: [
      { id: 2, email: 'testUser@mail.com', status: 'Pending' },
      { id: 25, email: 'realUser@mail.com', status: 'Active' },
      { id: 209, email: 'device@mail.com', status: 'Pending' },
    ],
  };

  return <TableComponent header={mockData.header} data={mockData.data} />;
};
