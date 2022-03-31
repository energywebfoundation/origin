import { IClaimData } from '@energyweb/issuer';
import {
  CertificateDTO,
  getIrecCertificateControllerGetAllQueryKey,
} from '@energyweb/issuer-irec-api-react-query-client';
import { BeneficiaryDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { Dayjs } from 'dayjs';
import { BigNumber } from '@ethersproject/bignumber';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useGetBlockchainCertificateHandler } from '../fetching';

export const useBlockchainRedeemCertificateHandler = (
  selectedBeneficiary: BeneficiaryDTO,
  resetList: () => void,
  startDate: Dayjs,
  endDate: Dayjs,
  purpose: string,
  setTxPending: Dispatch<SetStateAction<boolean>>
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const blockchainCertificatesQueryKey =
    getIrecCertificateControllerGetAllQueryKey();

  const { getBlockchainCertificate, isLoading: isGetBlockchainLoading } =
    useGetBlockchainCertificateHandler();

  const redeemHandler = async <Id>(id: Id, amount: string) => {
    try {
      const onChainCertificate = await getBlockchainCertificate(
        id as unknown as CertificateDTO['id']
      );
      const formattedAmount = BigNumber.from(
        PowerFormatter.getBaseValueFromValueInDisplayUnit(Number(amount))
      );
      const claimData: IClaimData = {
        beneficiary: selectedBeneficiary.name,
        location: selectedBeneficiary.location,
        countryCode: selectedBeneficiary.countryCode,
        periodStartDate: startDate.toISOString(),
        periodEndDate: endDate.toISOString(),
        purpose,
      };
      const transaction = await onChainCertificate.claim(
        claimData,
        formattedAmount
      );
      setTxPending(true);
      const receipt = await transaction.wait();
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      } else {
        setTxPending(false);
        showNotification(
          t('certificate.blockchainInbox.notifications.redeemSuccess'),
          NotificationTypeEnum.Success
        );
        queryClient.resetQueries(blockchainCertificatesQueryKey);
        resetList();
      }
    } catch (error) {
      console.error(error);
      showNotification(
        t('certificate.blockchainInbox.notifications.redeemError'),
        NotificationTypeEnum.Error
      );
    }
  };

  const isLoading = isGetBlockchainLoading;

  return { redeemHandler, isLoading };
};
