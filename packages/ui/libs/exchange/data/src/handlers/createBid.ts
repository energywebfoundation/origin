import {
  useOrderControllerCreateBid,
  CreateBidDTO,
} from '@energyweb/exchange-irec-react-query-client';
import {
  FormSelectOption,
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

type MarketFilters = {
  fuelType: FormSelectOption[];
  deviceType: FormSelectOption[];
  regions: FormSelectOption[];
  subregions: FormSelectOption[];
  gridOperator: FormSelectOption[];
  generationFrom: Dayjs;
  generationTo: Dayjs;
};

type BidFormValues = {
  energy: number;
  price: number;
};

export const useApiCreateBidHandler = (
  filters: MarketFilters,
  resetForm: () => void
) => {
  const { t } = useTranslation();
  const { mutate } = useOrderControllerCreateBid();

  return (values: BidFormValues) => {
    const preparedBid: CreateBidDTO = {
      price: values.price * 100,
      volume: PowerFormatter.getBaseValueFromValueInDisplayUnit(
        values.energy
      ).toString(),
      validFrom: dayjs().toISOString(),
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
        generationFrom: filters.generationFrom
          ? filters.generationFrom.toISOString()
          : undefined,
        generationTo: filters.generationTo
          ? filters.generationTo.toISOString()
          : undefined,
      },
    };

    mutate(
      { data: preparedBid },
      {
        onSuccess: () => {
          showNotification(
            t('exchange.viewMarket.notifications.createBidSuccess'),
            NotificationTypeEnum.Success
          );
          resetForm();
        },
        onError: () => {
          showNotification(
            t('exchange.viewMarket.notifications.createBidError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };
};
