import { useInvitationControllerGetInvitations } from '@energyweb/origin-backend-react-query-client';
import { getAuthenticationToken } from '@energyweb/origin-ui-shared-state';

export const useReceivedInvitationsData = () => {
  const authTokenExists = !!getAuthenticationToken();
  const { isLoading, data: invitations } =
    useInvitationControllerGetInvitations({
      query: { enabled: authTokenExists },
    });

  return { isLoading, invitations };
};
