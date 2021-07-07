import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  getCertificationRequestControllerGetAllQueryKey,
  useCertificationRequestControllerApprove,
  useCertificationRequestControllerRevoke,
  FullCertificationRequestDTO,
} from '@energyweb/issuer-irec-api-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useCertificationRequests } from './certificationRequests';

export const useApiPendingRequests = () => {
  const { requests, isLoading } = useCertificationRequests();
  const pendingRequests = requests.filter(
    (request) => request.revokedDate === null && request.approvedDate === null
  );

  return { pendingRequests, isLoading };
};

export const useApiHandlersForPendingRequests = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const certificationRequestsKey =
    getCertificationRequestControllerGetAllQueryKey();

  const filterRequest = (id: FullCertificationRequestDTO['id']) => {
    queryClient.setQueryData<FullCertificationRequestDTO[]>(
      certificationRequestsKey,
      (oldRequests) => {
        const filteredRequests = oldRequests.filter(
          (request) => request.id !== id
        );

        return [...filteredRequests];
      }
    );
  };

  const { mutate: approve } = useCertificationRequestControllerApprove({
    onMutate: async ({ id }) => filterRequest(id),
    onSuccess: () => {
      showNotification(
        t('certificate.pending.notifications.approveSuccess'),
        NotificationTypeEnum.Success
      );
    },
    onError: (error) => {
      console.log(error);
      showNotification(
        t('certificate.pending.notifications.approveError'),
        NotificationTypeEnum.Error
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(certificationRequestsKey);
    },
  });

  const { mutate: revoke } = useCertificationRequestControllerRevoke({
    onMutate: async ({ id }) => filterRequest(id),
    onSuccess: () => {
      showNotification(
        t('certificate.pending.notifications.revokeSuccess'),
        NotificationTypeEnum.Success
      );
    },
    onError: (error) => {
      console.log(error);
      showNotification(
        t('organization.invitations.notifications.revokeError'),
        NotificationTypeEnum.Error
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(certificationRequestsKey);
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
