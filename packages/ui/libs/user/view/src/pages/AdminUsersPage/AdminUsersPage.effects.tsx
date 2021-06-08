import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { useApiAdminFetchUsers } from '@energyweb/origin-ui-user-data';
import { useAdminUsersTableLogic } from '@energyweb/origin-ui-user-logic';
import { PermIdentityOutlined } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export const useAdminUsersPageEffects = () => {
  const { users, isLoading } = useApiAdminFetchUsers();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      icon: <PermIdentityOutlined data-cy="edit-user-icon" />,
      name: t('admin.users.update'),
      onClick: (id: UserDTO['id']) => navigate(`/admin/update-user/${id}`),
    },
  ];
  const tableProps = useAdminUsersTableLogic(users, actions, isLoading);

  return tableProps;
};
