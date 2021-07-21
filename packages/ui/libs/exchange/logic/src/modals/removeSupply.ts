import { useTranslation } from 'react-i18next';
import { TRemoveSupplyConfirmLogic } from './types';

export const useRemoveSupplyConfirmLogic: TRemoveSupplyConfirmLogic = (
  closeModal,
  submitHandler
) => {
  const { t } = useTranslation();
  return {
    title: t('exchange.supply.modals.removeSupplyConfirm.title'),
    text: '',
    buttons: [
      {
        label: t('exchange.supply.modals.removeSupplyConfirm.no'),
        onClick: closeModal,
        variant: 'outlined',
      },
      {
        label: t('exchange.supply.modals.removeSupplyConfirm.yes'),
        onClick: submitHandler,
      },
    ],
  };
};
