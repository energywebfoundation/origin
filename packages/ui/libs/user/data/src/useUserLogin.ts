import {
  accountControllerGetAccount,
  getAccountControllerGetAccountQueryKey,
} from '@energyweb/exchange-react-query-client';
import {
  OrganizationInvitationStatus,
  OrganizationStatus,
  UserStatus,
} from '@energyweb/origin-backend-core';
import {
  userControllerMe,
  invitationControllerGetInvitations,
  getUserControllerMeQueryKey,
  LoginDataDTO,
  useAppControllerLogin,
  getInvitationControllerGetInvitationsQueryKey,
  InvitationDTO,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { setAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import axios, { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';

export const useUserLogin = (
  openRegisterOrgModal: () => void,
  openInvitationModal: (invitation: InvitationDTO) => void,
  openExchangeAddressModal: () => void
) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();
  const invitationsQueryKey = getInvitationControllerGetInvitationsQueryKey();
  const accountQueryKey = getAccountControllerGetAccountQueryKey();

  const { mutate } = useAppControllerLogin();

  return (values: LoginDataDTO) => {
    mutate(
      { data: values },
      {
        onSuccess: async ({ accessToken }) => {
          setAuthenticationToken(accessToken);
          axios.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${accessToken}`;

          const user = await userControllerMe();

          const invitations = await invitationControllerGetInvitations();
          const pendingInvitations = invitations?.filter(
            (invitation) =>
              invitation.status === OrganizationInvitationStatus.Pending
          );

          const account = await accountControllerGetAccount();
          const exchangeAddress = account?.address;

          queryClient.setQueryData(userQueryKey, user);
          queryClient.setQueryData(invitationsQueryKey, invitations);
          queryClient.setQueryData(accountQueryKey, account);

          if (
            !user?.organization &&
            (!pendingInvitations || pendingInvitations?.length === 0)
          ) {
            openRegisterOrgModal();
            return;
          }

          if (!!pendingInvitations && pendingInvitations.length > 0) {
            const lastInvitation =
              pendingInvitations[pendingInvitations.length - 1];
            openInvitationModal(lastInvitation);
            return;
          }

          if (
            user?.organization.status === OrganizationStatus.Active &&
            user.status === UserStatus.Active &&
            !exchangeAddress
          ) {
            openExchangeAddressModal();
            return;
          }

          navigate('/');
        },
        onError: (error: AxiosError) => {
          console.error(error);
          showNotification(
            t('user.login.notifications.loginError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };
};
