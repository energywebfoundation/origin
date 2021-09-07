import { InvitationDTO } from '@energyweb/origin-backend-react-query-client';
import { TableComponentProps } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

const prepareSentInvitation = (invite: InvitationDTO) => ({
  id: invite.id,
  email: invite.email,
  status: invite.status,
});

export const useSentInvitationsTableLogic = (
  invitations: InvitationDTO[],
  loading: boolean
): TableComponentProps<InvitationDTO['id']> => {
  const { t } = useTranslation();

  return {
    header: {
      email: t('organization.invitations.email'),
      status: t('organization.invitations.status'),
    },
    loading,
    pageSize: 5,
    totalPages: Math.ceil(invitations?.length / 5),
    tableTitle: t('organization.invitations.sentTableTitle'),
    data: invitations?.map((invite) => prepareSentInvitation(invite)) ?? [],
  };
};
