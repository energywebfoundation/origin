import {
  FullCertificationRequestDTO,
  getCertificationRequestControllerGetAllQueryKey,
  useCertificationRequestControllerApprove,
  useCertificationRequestControllerRevoke,
} from '@energyweb/issuer-irec-api-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useApiHandlersForPendingRequests = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const certificationRequestsKey = getCertificationRequestControllerGetAllQueryKey();

  const { mutate: approve } = useCertificationRequestControllerApprove({
    onSuccess: () => {
      showNotification(
        t('certificate.pending.notifications.approveSuccess'),
        NotificationTypeEnum.Success
      );
      queryClient.invalidateQueries(certificationRequestsKey);
    },
    onError: (error: any) => {
      showNotification(
        `${t('certificate.pending.notifications.approveError')}:
        ${error?.response?.data?.message || ''}
        `,
        NotificationTypeEnum.Error
      );
    },
  });

  const { mutate: revoke } = useCertificationRequestControllerRevoke({
    onSuccess: () => {
      showNotification(
        t('certificate.pending.notifications.revokeSuccess'),
        NotificationTypeEnum.Success
      );
      queryClient.invalidateQueries(certificationRequestsKey);
    },
    onError: (error: any) => {
      showNotification(
        `${t('organization.invitations.notifications.revokeError')}:
        ${error?.response?.data?.message || ''}
        `,
        NotificationTypeEnum.Error
      );
    },
  });

  const approveHandler = (id: FullCertificationRequestDTO['id']) => {
    approve({ id });
  };

  const rejectHandler = (id: FullCertificationRequestDTO['id']) => {
    revoke({ id });
  };

  return { approveHandler, rejectHandler };
};
