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
import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useGetBlockchainCertificateHandler } from '../fetching';

export const useRetireCertificateHandler = (
  selectedBeneficiary: BeneficiaryDTO,
  resetList: () => void
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const blockchainCertificatesQueryKey =
    getIrecCertificateControllerGetAllQueryKey();

  const { getBlockchainCertificate, isLoading: isGetBlockchainLoading } =
    useGetBlockchainCertificateHandler();

  const retireHandler = async <Id>(id: Id, amount: string) => {
    try {
      const onChainCertificate = await getBlockchainCertificate(
        id as unknown as CertificateDTO['id']
      );
      const formattedAmount = BigNumber.from(
        PowerFormatter.getBaseValueFromValueInDisplayUnit(Number(amount))
      );
      const claimData: IClaimData = {
        beneficiary: selectedBeneficiary.organization.name,
        address: selectedBeneficiary.organization.address,
        zipCode: selectedBeneficiary.organization.zipCode,
        region: selectedBeneficiary.organization.city,
        countryCode: selectedBeneficiary.organization.country,
        //mock which should be here instead? additional datepickers?
        fromDate: dayjs().toISOString(),
        toDate: dayjs().toISOString(),
      };
      const transaction = await onChainCertificate.claim(
        claimData,
        formattedAmount
      );
      const receipt = await transaction.wait();
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }
      showNotification(
        t('certificate.blockchainInbox.notifications.retireSuccess'),
        NotificationTypeEnum.Success
      );
      queryClient.resetQueries(blockchainCertificatesQueryKey);
      resetList();
    } catch (error) {
      console.error(error);
      showNotification(
        t('certificate.blockchainInbox.notifications.retireError'),
        NotificationTypeEnum.Error
      );
    }
  };

  const isLoading = isGetBlockchainLoading;

  return { retireHandler, isLoading };
};
