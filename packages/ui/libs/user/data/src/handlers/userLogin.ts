import { accountControllerGetAccount } from '@energyweb/exchange-react-query-client';
import {
  isRole,
  OrganizationInvitationStatus,
  OrganizationStatus,
  Role,
  UserStatus,
} from '@energyweb/origin-backend-core';
import {
  userControllerMe,
  invitationControllerGetInvitations,
  LoginDataDTO,
  useAppControllerLogin,
  InvitationDTO,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { setAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';

export const useUserLogin = (
  openRegisterOrgModal: () => void,
  openInvitationModal: (invitation: InvitationDTO, user: UserDTO) => void,
  openExchangeAddressModal: () => void
) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

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

          try {
            const user = await userControllerMe();

            const invitations = await invitationControllerGetInvitations();
            const pendingInvitations = invitations?.filter(
              (invitation) =>
                invitation.status === OrganizationInvitationStatus.Pending
            );

            const account = await accountControllerGetAccount();
            const exchangeAddress = account?.address;

            if (
              !user?.organization &&
              (!pendingInvitations || pendingInvitations.length === 0)
            ) {
              openRegisterOrgModal();
            } else if (!!pendingInvitations && pendingInvitations.length > 0) {
              const lastInvitation =
                pendingInvitations[pendingInvitations.length - 1];
              openInvitationModal(lastInvitation, user);
            } else if (
              user?.organization.status === OrganizationStatus.Active &&
              user.status === UserStatus.Active &&
              !isRole(user, Role.Issuer) &&
              !isRole(user, Role.Admin) &&
              !isRole(user, Role.SupportAgent) &&
              !exchangeAddress
            ) {
              openExchangeAddressModal();
            } else {
              navigate('/');
              queryClient.resetQueries();
            }
          } catch (error) {
            console.error(error);
          }
        },
        onError: () => {
          showNotification(
            t('user.login.notifications.loginError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };
};
