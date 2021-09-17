import {
  useDemandControllerReplace,
  CreateDemandDTO,
  DemandDTO,
  getDemandControllerGetAllQueryKey,
  TimeFrame,
} from '@energyweb/exchange-irec-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

type TUpdateDemandFormValues = {
  period: TimeFrame;
  startDate: Date;
  endDate: Date;
  volume: number;
  price: number;
};

export const useApiUpdateDemandHandler = (
  demand: DemandDTO,
  closeModal: () => void
) => {
  const { mutate } = useDemandControllerReplace();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const allDemandsQueryKey = getDemandControllerGetAllQueryKey();

  return (values: TUpdateDemandFormValues) => {
    const data: CreateDemandDTO = {
      price: values.price * 100,
      volumePerPeriod: PowerFormatter.getBaseValueFromValueInDisplayUnit(
        values.volume
      ).toString(),
      periodTimeFrame: values.period,
      start: dayjs(values.startDate).toISOString(),
      end: dayjs(values.endDate).toISOString(),
      product: demand.product,
      boundToGenerationTime: false,
    };

    mutate(
      { id: demand.id, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(allDemandsQueryKey);
          closeModal();
          showNotification(
            t('exchange.myOrders.notifications.demandUpdateSuccess'),
            NotificationTypeEnum.Success
          );
        },
        onError: (error: any) => {
          closeModal();
          showNotification(
            `${t('exchange.myOrders.notifications.demandUpdateError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };
};
