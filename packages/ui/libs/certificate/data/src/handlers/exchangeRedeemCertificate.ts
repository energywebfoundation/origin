import {
  AccountAssetDTO,
  getAccountBalanceControllerGetQueryKey,
} from '@energyweb/exchange-react-query-client';
import {
  useIrecTransferControllerRequestClaim,
  IrecRequestClaimDTO,
} from '@energyweb/exchange-irec-react-query-client';
import { BeneficiaryDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import {
  showNotification,
  NotificationTypeEnum,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import dayjs, { Dayjs } from 'dayjs';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useCachedUser } from '../cached';

export const useExchangeRedeemCertificateHandler = (
  exchangeCertificates: AccountAssetDTO[],
  beneficiary: BeneficiaryDTO,
  startDate: Dayjs,
  endDate: Dayjs,
  purpose: string,
  resetList: () => void,
  setTxPending: Dispatch<SetStateAction<boolean>>
) => {
  const { t } = useTranslation();
  const { mutate, isLoading } = useIrecTransferControllerRequestClaim();
  const queryClient = useQueryClient();
  const exchangeCertificatesQueryKey = getAccountBalanceControllerGetQueryKey();

  const user = useCachedUser();

  const redeemHandler = <Id>(id: Id, amount: string) => {
    setTxPending(true);
    const assetId = exchangeCertificates.find(
      (cert) =>
        cert.asset.id === (id as unknown as AccountAssetDTO['asset']['id'])
    )?.asset.id;

    const data: IrecRequestClaimDTO = {
      assetId,
      amount: PowerFormatter.getBaseValueFromValueInDisplayUnit(
        Number(amount)
      ).toString(),
      beneficiary: {
        countryCode: beneficiary?.countryCode ?? '',
        irecId: beneficiary?.irecBeneficiaryId ?? 0,
        location: beneficiary?.location ?? '',
        name: beneficiary?.name ?? '',
      },
      periodStartDate: dayjs(startDate).toISOString(),
      periodEndDate: dayjs(endDate).toISOString(),
      purpose,
      claimAddress: user?.organization?.blockchainAccountAddress ?? undefined,
    };

    mutate(
      { data },
      {
        onSuccess: () => {
          showNotification(
            t('certificate.exchangeInbox.notifications.redeemSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(exchangeCertificatesQueryKey);
          resetList();
        },
        onError: (error: any) => {
          showNotification(
            `${t('certificate.exchangeInbox.notifications.redeemError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
        onSettled: () => setTxPending(false),
      }
    );
  };

  return { redeemHandler, isMutating: isLoading };
};
