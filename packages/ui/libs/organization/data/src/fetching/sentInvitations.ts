import {
  useOrganizationControllerGetInvitationsForOrganization,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';

export const useSentOrgInvitationsData = () => {
  const { data: user, isLoading: userLoading } = useUserControllerMe();

  const { data: invitations, isLoading: invitationsLoading } =
    useOrganizationControllerGetInvitationsForOrganization(
      user?.organization?.id
    );

  return { isLoading: userLoading || invitationsLoading, invitations };
};
