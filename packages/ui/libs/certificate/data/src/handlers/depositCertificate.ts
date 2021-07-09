import { useAccountControllerGetAccount } from '@energyweb/exchange-react-query-client';
import {
  CertificateDTO,
  getIrecCertificateControllerGetAllQueryKey,
} from '@energyweb/issuer-irec-api-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useGetBlockchainCertificateHandler } from '../fetching';

export const useDepositCertificateHandler = (resetList: () => void) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const blockchainCertificatesQueryKey =
    getIrecCertificateControllerGetAllQueryKey();

  const { data: account, isLoading: isAccountLoading } =
    useAccountControllerGetAccount();

  const { getBlockchainCertificate, isLoading: isGetBlockchainLoading } =
    useGetBlockchainCertificateHandler();

  const depositHandler = async <Id>(id: Id, amount: string) => {
    try {
      const onChainCertificate = await getBlockchainCertificate(
        id as unknown as CertificateDTO['id']
      );
      const formattedAmount = BigNumber.from(
        PowerFormatter.getBaseValueFromValueInDisplayUnit(Number(amount))
      );
      const transaction = await onChainCertificate.transfer(
        account.address,
        formattedAmount
      );
      const receipt = await transaction.wait();
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }
      showNotification(
        t('certificate.blockchainInbox.notifications.depositSuccess'),
        NotificationTypeEnum.Success
      );
      queryClient.resetQueries(blockchainCertificatesQueryKey);
      resetList();
    } catch (error) {
      console.error(error);
      showNotification(
        t('certificate.blockchainInbox.notifications.depositError'),
        NotificationTypeEnum.Error
      );
    }
  };

  const isLoading = isAccountLoading || isGetBlockchainLoading;

  return { depositHandler, isLoading };
};
