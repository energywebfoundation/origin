import { useTranslation } from 'react-i18next';
import { TIRecConnectOrRegisterLogic } from './types';

export const useIRecConnectOrRegisterLogic: TIRecConnectOrRegisterLogic = (
  notNow,
  register
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
        onClick: notNow,
        variant: 'outlined',
      },
      {
        label: t('organization.modals.iRecConnectOrRegister.buttonRegister'),
        onClick: register,
      },
    ],
  };
};
