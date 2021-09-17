import { Role } from '@energyweb/origin-backend-core';
import { InvitationDTO } from '@energyweb/origin-backend-react-query-client';
import { useTranslation } from 'react-i18next';

export const roleNames = [
  {
    value: Role.OrganizationAdmin,
    label: 'user.modals.roleOrgAdmin',
  },
  {
    value: Role.OrganizationDeviceManager,
    label: 'user.modals.roleOrgDeviceManager',
  },
  {
    value: Role.OrganizationUser,
    label: 'user.modals.roleOrgMember',
  },
];

type TUsePendingInvitationModalLogicArgs = {
  invitation: InvitationDTO;
  acceptHandler: (id: InvitationDTO['id']) => void;
  declineHandler: (id: InvitationDTO['id']) => void;
  laterHandler: (id: InvitationDTO['id']) => void;
};

export const usePendingInvitationModalLogic = ({
  invitation,
  acceptHandler,
  declineHandler,
  laterHandler,
}: TUsePendingInvitationModalLogicArgs) => {
  const { t } = useTranslation();
  return {
    title: t('user.modals.pendingInvitation.title'),
    text: t('user.modals.pendingInvitation.text', {
      admin: invitation?.sender,
      role: t(roleNames.find((role) => role.value === invitation?.role)?.label),
      orgName: invitation?.organization.name,
    }),
    buttons: [
      {
        label: t('general.buttons.later'),
        onClick: () => laterHandler(invitation.id),
      },
      {
        label: t('general.buttons.decline'),
        onClick: () => declineHandler(invitation.id),
      },
      {
        label: t('general.buttons.accept'),
        onClick: () => acceptHandler(invitation.id),
      },
    ],
  };
};
