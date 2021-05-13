import { getRolesFromRights } from '@energyweb/origin-backend-core';
import { User } from '@energyweb/origin-backend-react-query-client';
import { TableRowData } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';
import { roleNames } from '../utils';

export const formatOrgMembers = (
  t: TFunction,
  users: User[]
): TableRowData<User['id']>[] => {
  // @should also add actions
  return users?.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: getRolesFromRights(user.rights)?.map((role) =>
      t(roleNames.filter((roleName) => roleName.value === role)[0].label)
    ),
  }));
};
