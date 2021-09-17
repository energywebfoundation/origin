import { useTranslation } from 'react-i18next';

export const useUserRegisteredModalLogic = (closeModal: () => void) => {
  const { t } = useTranslation();
  return {
    title: t('user.modals.userRegistered.title'),
    text: t('user.modals.userRegistered.text'),
    buttons: [
      {
        label: t('general.buttons.ok'),
        onClick: closeModal,
      },
    ],
  };
};
