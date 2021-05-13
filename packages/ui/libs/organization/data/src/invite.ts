import {
  InviteDTO,
  useInvitationControllerInvite,
} from '@energyweb/origin-backend-react-query-client';

export const useOrganizationInviteHandler = () => {
  const { mutate } = useInvitationControllerInvite();

  return (values: InviteDTO) => mutate({ data: values });
};
