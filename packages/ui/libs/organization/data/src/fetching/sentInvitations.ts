import { useOrganizationControllerGetInvitationsForOrganization } from '@energyweb/origin-backend-react-query-client';
import { useUser } from './user';

export const useSentOrgInvitationsData = () => {
  const { user, userLoading, isAuthenticated } = useUser();

  const { data: invitations, isLoading: invitationsLoading } =
    useOrganizationControllerGetInvitationsForOrganization(
      user?.organization?.id,
      {
        query: { enabled: isAuthenticated },
      }
    );

  return { isLoading: userLoading || invitationsLoading, invitations };
};
