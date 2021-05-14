import {
  UserDTO,
  useInvitationControllerGetInvitations,
  useOrganizationControllerGetInvitationsForOrganization,
  useInvitationControllerUpdateInvitation,
  InvitationDTO,
  OrganizationInvitationStatus,
} from '@energyweb/origin-backend-react-query-client';

export const useSentOrgInvitationsData = (
  orgId: UserDTO['organization']['id']
) => {
  const {
    data,
    isLoading,
  } = useOrganizationControllerGetInvitationsForOrganization(orgId);
  const invitations = data?.data;

  return { isLoading, invitations };
};

export const useReceivedInvitationsData = () => {
  const { isLoading, data } = useInvitationControllerGetInvitations();
  const invitations = data?.data;

  return { isLoading, invitations };
};

export const useReceivedInvitationsActions = () => {
  const { mutate } = useInvitationControllerUpdateInvitation();

  const acceptInvite = (id: InvitationDTO['id']) =>
    mutate({
      id: id.toString(),
      status: OrganizationInvitationStatus.Accepted,
    });

  const rejectInvite = (id: InvitationDTO['id']) =>
    mutate({
      id: id.toString(),
      status: OrganizationInvitationStatus.Rejected,
    });

  return { acceptInvite, rejectInvite };
};
