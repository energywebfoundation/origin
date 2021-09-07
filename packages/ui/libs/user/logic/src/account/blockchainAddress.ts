import { useTranslation } from 'react-i18next';

export const useOrganizationBlockchainAddressLogic = () => {
  const { t } = useTranslation();
  return {
    title: t('user.profile.orgBlockchainAccountAddress'),
    popoverText: [
      t('user.profile.popover.blockchainWhatIs'),
      t('user.profile.popover.blockchainWhatFor'),
      t('user.profile.popover.blockchainHowTo'),
    ],
    buttonText: t('user.profile.connectBlockchain'),
  };
};
