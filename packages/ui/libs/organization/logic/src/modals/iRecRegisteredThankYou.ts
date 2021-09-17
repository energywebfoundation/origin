import { useTranslation } from 'react-i18next';
import { TIRecRegisteredThankYouLogic } from './types';

export const useIRecRegisteredThankYouLogic: TIRecRegisteredThankYouLogic = (
  closeModal
) => {
  const { t } = useTranslation();
  return {
    title: t('organization.modals.iRecRegisteredThankYou.title'),
    text: t('organization.modals.iRecRegisteredThankYou.text'),
    buttons: [
      {
        label: t('general.buttons.ok'),
        onClick: closeModal,
      },
    ],
  };
};
