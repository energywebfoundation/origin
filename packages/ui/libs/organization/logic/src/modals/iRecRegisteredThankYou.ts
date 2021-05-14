import { useTranslation } from 'react-i18next';
import { TIRecRegisteredThankYouLogic } from './types';

export const useIRecRegisteredThankYouLogic: TIRecRegisteredThankYouLogic = () => {
  const { t } = useTranslation();
  return {
    title: t('organization.modals.IRecRegisteredThankYou.title'),
    text: t('organization.modals.IRecRegisteredThankYou.text'),
    buttons: [
      {
        label: t('general.buttons.ok'),
        onClick: () =>
          console.log('Should be redirect to default my organization'),
      },
    ],
  };
};
