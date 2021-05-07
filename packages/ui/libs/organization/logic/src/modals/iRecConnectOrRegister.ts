import { useTranslation } from 'react-i18next';
import { TIRecConnectOrRegisterLogic } from './types';

export const useIRecConnectOrRegisterLogic: TIRecConnectOrRegisterLogic = (
  setOpen
) => {
  const { t } = useTranslation();
  return {
    title: t('organization.modals.iRecConnectOrRegister.title'),
    text: [
      t('organization.modals.iRecConnectOrRegister.text1'),
      t('organization.modals.iRecConnectOrRegister.text2'),
    ],
    buttons: [
      {
        label: t('general.buttons.notNow'),
        onClick: () => setOpen(false),
        variant: 'outlined',
      },
      {
        label: t('organization.modals.iRecConnectOrRegister.buttonRegister'),
        onClick: () => console.log('Navigate to register I-Rec'),
      },
    ],
  };
};
