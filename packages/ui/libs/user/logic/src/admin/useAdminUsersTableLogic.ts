import {
  InvitationDTO,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';
import {
  TableActionData,
  TableComponentProps,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

const prepareUsersData = (
  user: UserDTO,
  actions: TableActionData<UserDTO['id']>[]
) => ({
  id: user.id,
  name: `${user.firstName} ${user.lastName}`,
  organization: user.organization?.name,
  email: user.email,
  status: user.status,
  kycStatus: user.kycStatus,
  actions: actions,
});

export const useAdminUsersTableLogic = (
  users: UserDTO[],
  actions: TableActionData<UserDTO['id']>[],
  loading: boolean
): TableComponentProps<InvitationDTO['id']> => {
  const { t } = useTranslation();
  return {
    header: {
      name: t('admin.users.name'),
      organization: t('admin.users.organization'),
      email: t('admin.users.email'),
      status: t('admin.users.status'),
      kycStatus: t('admin.users.kycStatus'),
      actions: '',
    },
    loading,
    pageSize: 25,
    data: users?.map((user) => prepareUsersData(user, actions)) ?? [],
  };
};
