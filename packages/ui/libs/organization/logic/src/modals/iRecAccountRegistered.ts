import { useTranslation } from 'react-i18next';
import { TIRecAccountRegisteredLogic } from './types';

export const useIRecAccountRegisteredLogic: TIRecAccountRegisteredLogic = (
  closeModal
) => {
  const { t } = useTranslation();
  return {
    title: t('organization.modals.iRecAccountRegistered.title'),
    text: t('organization.modals.iRecAccountRegistered.text'),
    buttons: [
      {
        label: t('general.buttons.ok'),
        onClick: closeModal,
      },
    ],
  };
};
