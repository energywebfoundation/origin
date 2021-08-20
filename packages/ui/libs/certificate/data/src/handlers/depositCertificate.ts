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
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import {
  useGetBlockchainCertificateHandler,
  useExchangeAddress,
} from '../fetching';

export const useDepositCertificateHandler = (
  resetList: () => void,
  setTxPending: Dispatch<SetStateAction<boolean>>
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const blockchainCertificatesQueryKey =
    getIrecCertificateControllerGetAllQueryKey();

  const { exchangeAddress, isLoading: isExchangeAddressLoading } =
    useExchangeAddress();

  const { data: account, isLoading: isAccountLoading } =
    useAccountControllerGetAccount();

  const { getBlockchainCertificate, isLoading: isGetBlockchainLoading } =
    useGetBlockchainCertificateHandler();

  const depositHandler = async <Id>(id: Id, amount: string) => {
    if (!exchangeAddress) {
      showNotification(
        t(
          'certificate.blockchainInbox.notifications.onlyUsersWithExchangeAddress'
        )
      );
      return;
    }

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
      setTxPending(true);
      const receipt = await transaction.wait();
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      } else {
        setTxPending(false);
        showNotification(
          t('certificate.blockchainInbox.notifications.depositSuccess'),
          NotificationTypeEnum.Success
        );
        queryClient.resetQueries(blockchainCertificatesQueryKey);
        resetList();
      }
    } catch (error) {
      showNotification(
        t('certificate.blockchainInbox.notifications.depositError'),
        NotificationTypeEnum.Error
      );
    }
  };

  const isLoading =
    isAccountLoading || isGetBlockchainLoading || isExchangeAddressLoading;

  return { depositHandler, isLoading };
};
