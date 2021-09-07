import { OrganizationInvitationStatus } from '@energyweb/origin-backend-core';
import { InvitationDTO } from '@energyweb/origin-backend-react-query-client';
import {
  TableActionData,
  TableComponentProps,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

const prepareReceivedInvitation = (
  invite: InvitationDTO,
  actions: TableActionData<InvitationDTO['id']>[]
) => ({
  id: invite.id,
  orgName: invite.organization.name,
  email: invite.email,
  status: invite.status,
  actions:
    OrganizationInvitationStatus[invite.status] ===
      OrganizationInvitationStatus.Pending ||
    OrganizationInvitationStatus[invite.status] ===
      OrganizationInvitationStatus.Viewed
      ? actions
      : undefined,
});

export const useReceivedInvitationsTableLogic = (
  invitations: InvitationDTO[],
  actions: TableActionData<InvitationDTO['id']>[],
  loading: boolean
): TableComponentProps<InvitationDTO['id']> => {
  const { t } = useTranslation();
  return {
    header: {
      orgName: t('organization.invitations.organization'),
      email: t('organization.invitations.email'),
      status: t('organization.invitations.status'),
      actions: '',
    },
    loading,
    tableTitle: t('organization.invitations.receivedTableTitle'),
    data:
      invitations?.map((invite) =>
        prepareReceivedInvitation(invite, actions)
      ) ?? [],
  };
};
