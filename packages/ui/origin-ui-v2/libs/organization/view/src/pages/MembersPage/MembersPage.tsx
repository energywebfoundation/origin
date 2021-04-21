import { TableComponent, TableComponentProps } from '@energyweb/origin-ui-core';
import { Delete } from '@material-ui/icons';
import React from 'react';
import { FC } from 'react';

export const MembersPage: FC = () => {
  const mockData: TableComponentProps = {
    header: {
      firstName: 'First Name',
      lastName: 'Last name',
      email: 'Email',
      role: 'Role',
      actions: '',
    },
    data: [
      {
        id: 2,
        firstName: 'Device',
        lastName: 'Manager',
        email: 'testUser@mail.com',
        role: 'Admin',
        actions: [
          {
            name: 'Delete user',
            icon: <Delete />,
            onClick: (id) => console.log(id),
          },
        ],
      },
      {
        id: 4,
        firstName: 'First',
        lastName: 'Person',
        email: 'userPerson@mail.com',
        role: 'Device Manager',
        actions: [
          {
            name: 'Delete user',
            icon: <Delete />,
            onClick: (id) => console.log(id),
          },
        ],
      },
      {
        id: 6,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@mail.com',
        role: 'Member',
      },
      {
        id: 10,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@mail.com',
        role: 'Member',
      },
    ],
  };

  return <TableComponent header={mockData.header} data={mockData.data} />;
};
