import { InvitationDTO } from '@energyweb/origin-backend-react-query-client';
import { TableComponentProps } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

const prepareSentInvitation = (invite: InvitationDTO) => ({
  id: invite.id,
  email: invite.email,
  status: invite.status,
});

export const createSentInvitationsTable = (
  t: TFunction,
  invitations: InvitationDTO[]
): TableComponentProps<InvitationDTO['id']> => {
  return {
    header: {
      email: t('organization.invitations.email'),
      status: t('organization.invitations.status'),
    },
    // @should be received from query
    loading: false,
    pageSize: 5,
    totalPages: Math.ceil(invitations?.length / 5),
    tableTitle: t('organization.invitations.sentTableTitle'),
    data: invitations?.map((invite) => prepareSentInvitation(invite)) ?? [],
  };
};
