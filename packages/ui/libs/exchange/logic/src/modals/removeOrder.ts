import { useTranslation } from 'react-i18next';
import { TRemoveConfirmModalLogic } from './types';

export const useRemoveOrderConfirmLogic: TRemoveConfirmModalLogic = (
  closeModal,
  submitHandler
) => {
  const { t } = useTranslation();
  return {
    title: t('exchange.myOrders.modals.removeOrderConfirm.title'),
    text: '',
    buttons: [
      {
        label: t('general.buttons.no'),
        onClick: closeModal,
        variant: 'outlined',
      },
      {
        label: t('general.buttons.yes'),
        onClick: submitHandler,
      },
    ],
  };
};
