import { useTranslation } from 'react-i18next';
import { roleNamesMembersPage } from '../utils';
import { TChangeMemberRoleLogic } from './types';

export const useChangeMemberRoleLogic: TChangeMemberRoleLogic = ({
  userToUpdate,
  closeModal,
  changeRoleHandler,
  buttonDisabled,
}) => {
  const { t } = useTranslation();

  return {
    title: userToUpdate
      ? t('organization.modals.changeMemberRole.title', {
          username: `${userToUpdate.firstName}  ${userToUpdate.lastName}`,
        })
      : '',
    errorExists: false,
    errorText: '',
    field: {
      name: 'member-change-role-select',
      label: 'New role',
      options: roleNamesMembersPage(t),
    },
    buttons: [
      {
        label: t('general.buttons.cancel'),
        onClick: closeModal,
        variant: 'text',
        color: 'secondary',
      },
      {
        label: t('general.buttons.change'),
        onClick: changeRoleHandler,
        disabled: buttonDisabled,
      },
    ],
  };
};
