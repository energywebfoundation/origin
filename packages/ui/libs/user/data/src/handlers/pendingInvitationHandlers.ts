import {
  InvitationDTO,
  OrganizationInvitationStatus,
  useInvitationControllerUpdateInvitation,
} from '@energyweb/origin-backend-react-query-client';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';

export const usePendingInvitationModalHandlers = (
  closeModal: () => void,
  openRoleChangeModal: () => void
) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate } = useInvitationControllerUpdateInvitation();

  const queryClient = useQueryClient();

  const acceptHandler = (id: InvitationDTO['id']) => {
    mutate(
      { id: id.toString(), status: OrganizationInvitationStatus.Accepted },
      {
        onSuccess: () => {
          closeModal();
          openRoleChangeModal();
          showNotification(
            t('user.modals.pendingInvitation.acceptSuccess'),
            NotificationTypeEnum.Success
          );
        },
        onError: (error: any) => {
          showNotification(
            `${t('user.modals.pendingInvitation.acceptError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  const declineHandler = (id: InvitationDTO['id']) => {
    mutate(
      { id: id.toString(), status: OrganizationInvitationStatus.Rejected },
      {
        onSuccess: () => {
          closeModal();
          queryClient.resetQueries();
          navigate('/');
          showNotification(
            t('user.modals.pendingInvitation.declineSuccess'),
            NotificationTypeEnum.Success
          );
        },
        onError: (error: any) => {
          showNotification(
            `${t('user.modals.pendingInvitation.declineError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  const laterHandler = (id: InvitationDTO['id']) => {
    mutate(
      { id: id.toString(), status: OrganizationInvitationStatus.Viewed },
      {
        onSuccess: () => {
          closeModal();
          queryClient.resetQueries();
          navigate('/');
          showNotification(
            t('user.modals.pendingInvitation.laterSuccess'),
            NotificationTypeEnum.Success
          );
        },
        onError: () => {
          showNotification(
            t('user.modals.pendingInvitation.laterError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { acceptHandler, declineHandler, laterHandler };
};
