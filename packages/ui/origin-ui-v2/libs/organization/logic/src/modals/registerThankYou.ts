import { useTranslation } from 'react-i18next';
import { TRegisterThankYouLogic } from './types';

export const useRegisterThankYouLogic: TRegisterThankYouLogic = () => {
  const { t } = useTranslation();
  return {
    title: t('organization.modals.registerThankYou.title'),
    text: t('organization.modals.registerThankYou.text1'),
    buttons: [
      {
        label: t('general.buttons.ok'),
        onClick: () =>
          console.log('Here should be func to navigate to default page'),
      },
    ],
  };
};
