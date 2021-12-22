import {
  AccountAssetDTO,
  ClaimDataDTO,
  getAccountBalanceControllerGetQueryKey,
  RequestClaimDTO,
  useTransferControllerRequestClaim,
} from '@energyweb/exchange-react-query-client';
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

export const useClaimCertificateHandler = (
  exchangeCertificates: AccountAssetDTO[],
  beneficiary: BeneficiaryDTO,
  startDate: Dayjs,
  endDate: Dayjs,
  purpose: string,
  resetList: () => void,
  setTxPending: Dispatch<SetStateAction<boolean>>
) => {
  const { t } = useTranslation();
  const { mutate, isLoading } = useTransferControllerRequestClaim();
  const queryClient = useQueryClient();
  const exchangeCertificatesQueryKey = getAccountBalanceControllerGetQueryKey();

  const user = useCachedUser();

  const claimHandler = <Id>(id: Id, amount: string) => {
    setTxPending(true);
    const assetId = exchangeCertificates.find(
      (cert) =>
        cert.asset.id === (id as unknown as AccountAssetDTO['asset']['id'])
    )?.asset.id;

    const claimData: ClaimDataDTO = {
      beneficiary: beneficiary?.name ?? '',
      location: beneficiary?.location ?? '',
      countryCode: beneficiary?.countryCode ?? '',
      periodStartDate: dayjs(startDate).toISOString(),
      periodEndDate: dayjs(endDate).toISOString(),
      purpose,
    };

    const data: RequestClaimDTO = {
      assetId,
      amount: PowerFormatter.getBaseValueFromValueInDisplayUnit(
        Number(amount)
      ).toString(),
      claimData,
      claimAddress: user?.organization?.blockchainAccountAddress ?? undefined,
    };

    mutate(
      { data },
      {
        onSuccess: () => {
          showNotification(
            t('certificate.exchangeInbox.notifications.claimSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(exchangeCertificatesQueryKey);
          resetList();
        },
        onError: (error: any) => {
          showNotification(
            `${t('certificate.exchangeInbox.notifications.claimError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
        onSettled: () => setTxPending(false),
      }
    );
  };

  return { claimHandler, isMutating: isLoading };
};
