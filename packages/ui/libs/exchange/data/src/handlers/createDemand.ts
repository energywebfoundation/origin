import {
  CreateDemandDTO,
  TimeFrame,
  useDemandControllerCreate,
} from '@energyweb/exchange-irec-react-query-client';
import {
  FormSelectOption,
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { Dayjs } from 'dayjs';
import { UseFormReset } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type MarketFilters = {
  fuelType: FormSelectOption[];
  deviceType: FormSelectOption[];
  regions: FormSelectOption[];
  subregions: FormSelectOption[];
  gridOperator: FormSelectOption[];
};

type DemandFormValues = {
  period: TimeFrame;
  volume: number;
  startDate: Dayjs;
  endDate: Dayjs;
  price: number;
};

export const useApiCreateDemandHandler = (
  filters: MarketFilters,
  reset: UseFormReset<DemandFormValues>
) => {
  const { t } = useTranslation();
  const { mutate } = useDemandControllerCreate();

  return (values: DemandFormValues) => {
    const preparedDemand: CreateDemandDTO = {
      price: values.price * 100,
      volumePerPeriod: PowerFormatter.getBaseValueFromValueInDisplayUnit(
        values.volume
      ).toString(),
      periodTimeFrame: values.period,
      start: values.startDate.toISOString(),
      end: values.endDate.toISOString(),
      product: {
        deviceType:
          filters.deviceType.length > 0
            ? filters.deviceType.map((option) => option.value.toString())
            : undefined,
        gridOperator:
          filters.gridOperator.length > 0
            ? filters.gridOperator.map((option) => option.value.toString())
            : undefined,
        location:
          filters.subregions.length > 0
            ? filters.subregions.map((option) => option.value.toString())
            : undefined,
      },
      boundToGenerationTime: false,
    };

    mutate(
      { data: preparedDemand },
      {
        onSuccess: () => {
          showNotification(
            t('exchange.viewMarket.notifications.createDemandSuccess'),
            NotificationTypeEnum.Success
          );
          reset();
        },
        onError: (error: any) => {
          showNotification(
            `${t('exchange.viewMarket.notifications.createDemandError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };
};
