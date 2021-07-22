import { useTranslation } from 'react-i18next';

export const useCreateExchangeAddressModalLogic = (
  closeModal: () => void,
  navigateToCreate: () => void
) => {
  const { t } = useTranslation();
  return {
    title: t('user.modals.createExchangeAddress.title'),
    text: t('user.modals.createExchangeAddress.text'),
    buttons: [
      {
        label: t('general.buttons.notNow'),
        onClick: closeModal,
      },
      {
        label: t('user.modals.createExchangeAddress.create'),
        onClick: navigateToCreate,
      },
    ],
  };
};
