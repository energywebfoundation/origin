import { useInvitationControllerGetInvitations } from '@energyweb/origin-backend-react-query-client';

export const useReceivedInvitationsData = () => {
  const { isLoading, data: invitations } =
    useInvitationControllerGetInvitations();

  return { isLoading, invitations };
};
