import { useTranslation } from 'react-i18next';

export const useExchangeDepositAddressLogic = () => {
  const { t } = useTranslation();
  return {
    title: t('user.profile.exchangeAddressTitle'),
    popoverText: [
      t('user.profile.popover.exchangeAddressWhatFor'),
      t('user.profile.popover.exchangeAddressHowTo'),
    ],
    buttonText: t('user.profile.createExchangeAddressButton'),
  };
};
