import {
  DemandDTO,
  DemandStatus,
  getDemandControllerGetAllQueryKey,
  useDemandControllerArchive,
} from '@energyweb/exchange-irec-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useCachedAllDemands } from '../cached';

export const useApiRemoveDemandHandler = () => {
  const { mutate } = useDemandControllerArchive();
  const { t } = useTranslation();
  const allDemands = useCachedAllDemands();
  const queryClient = useQueryClient();
  const demandsQueryKey = getDemandControllerGetAllQueryKey();

  return (id: DemandDTO['id'], closeModal: () => void) => {
    const demandToDelete = allDemands.find((demand) => demand.id === id);
    if (demandToDelete.status !== DemandStatus.PAUSED) {
      closeModal();
      return showNotification(
        t('exchange.myOrders.notifications.demandShouldBePaused'),
        NotificationTypeEnum.Info
      );
    }

    mutate(
      { id },
      {
        onSuccess: () => {
          showNotification(
            t('exchange.myOrders.notifications.demandRemoveSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(demandsQueryKey);
          closeModal();
        },
        onError: (error: any) => {
          showNotification(
            `${t('exchange.myOrders.notifications.demandRemoveError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
          closeModal();
        },
      }
    );
  };
};
