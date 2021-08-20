import {
  DemandDTO,
  DemandStatus,
  getDemandControllerGetAllQueryKey,
  useDemandControllerPause,
  useDemandControllerResume,
} from '@energyweb/exchange-irec-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useApiChangeDemandStatus = (closeModal: () => void) => {
  const { t } = useTranslation();
  const { mutate: mutatePause } = useDemandControllerPause();
  const { mutate: mutateResume } = useDemandControllerResume();
  const queryClient = useQueryClient();
  const allDemandsQueryKey = getDemandControllerGetAllQueryKey();

  return (id: DemandDTO['id'], newStatus: DemandStatus) => {
    if (newStatus === DemandStatus.PAUSED) {
      return mutatePause(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(allDemandsQueryKey);
            closeModal();
            showNotification(
              t('exchange.myOrders.notifications.demandPausedSuccess'),
              NotificationTypeEnum.Success
            );
          },
          onError: (error: any) => {
            closeModal();
            showNotification(
              `${t('exchange.myOrders.notifications.demandPausedError')}:
              ${error?.response?.data?.message || ''}
              `,
              NotificationTypeEnum.Error
            );
          },
        }
      );
    } else {
      return mutateResume(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(allDemandsQueryKey);
            closeModal();
            showNotification(
              t('exchange.myOrders.notifications.demandResumedSuccess'),
              NotificationTypeEnum.Success
            );
          },
          onError: (error: any) => {
            closeModal();
            showNotification(
              `${t('exchange.myOrders.notifications.demandResumedError')}:
              ${error?.response?.data?.message || ''}
              `,
              NotificationTypeEnum.Error
            );
          },
        }
      );
    }
  };
};
