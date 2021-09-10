import {
  AccountAssetDTO,
  BundleItemDTO,
  CreateBundleDTO,
  getAccountBalanceControllerGetQueryKey,
  useBundleControllerCreateBundle,
} from '@energyweb/exchange-react-query-client';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import {
  showNotification,
  NotificationTypeEnum,
} from '@energyweb/origin-ui-core';
import { useQueryClient } from 'react-query';
type EnergyAmounts<Id> = {
  id: Id;
  amount: string;
};

export const useCreateBundleHandler = (
  price: string,
  resetList: () => void
) => {
  const { t } = useTranslation();
  const { mutate } = useBundleControllerCreateBundle();
  const queryClient = useQueryClient();
  const exchangeCertificatesQueryKey = getAccountBalanceControllerGetQueryKey();

  return <Id>(energyAmounts: EnergyAmounts<Id>[]) => {
    const bundleItems: BundleItemDTO[] = energyAmounts.map((item) => ({
      assetId: (item.id as unknown) as AccountAssetDTO['asset']['id'],
      volume: PowerFormatter.getBaseValueFromValueInDisplayUnit(
        parseInt(item.amount)
      ).toString(),
    }));
    const data: CreateBundleDTO = {
      price: Math.round((Number(price) + Number.EPSILON) * 100),
      items: bundleItems,
    };

    mutate(
      { data },
      {
        onSuccess: () => {
          showNotification(
            t('exchange.createBundle.notifications.createSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(exchangeCertificatesQueryKey);
          resetList();
        },
        onError: (error: any) => {
          showNotification(
            `${t('exchange.createBundle.notifications.createError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };
};
