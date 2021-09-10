import { useTranslation } from 'react-i18next';
import { TRegisterThankYouLogic } from './types';

export const useRegisterThankYouLogic: TRegisterThankYouLogic = (
  closeModal
) => {
  const { t } = useTranslation();
  return {
    title: t('organization.modals.registerThankYou.title'),
    text: t('organization.modals.registerThankYou.text'),
    buttons: [
      {
        label: t('general.buttons.ok'),
        onClick: closeModal,
      },
    ],
  };
};
