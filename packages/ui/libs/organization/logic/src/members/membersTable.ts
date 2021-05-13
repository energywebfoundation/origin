import { User } from '@energyweb/origin-backend-react-query-client';
import { TableComponentProps } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';
import { formatOrgMembers } from './formatMembers';

export const createMembersTable = (
  t: TFunction,
  users: User[]
): TableComponentProps<User['id']> => {
  return {
    header: {
      firstName: t('organization.members.firstName'),
      lastName: t('organization.members.lastName'),
      email: t('organization.members.email'),
      role: t('organization.members.role'),
      actions: '',
    },
    pageSize: 5,
    totalPages: Math.ceil(users?.length / 5),
    data: formatOrgMembers(t, users) ?? [],
  };
};
