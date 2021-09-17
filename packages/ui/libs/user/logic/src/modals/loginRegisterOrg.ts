import { useTranslation } from 'react-i18next';

export const useLoginRegisterOrgModalLogic = (
  closeModal: () => void,
  navigateToRegister: () => void
) => {
  const { t } = useTranslation();
  return {
    title: t('user.modals.loginRegisterOrg.title'),
    text: t('user.modals.loginRegisterOrg.text'),
    buttons: [
      {
        label: t('general.buttons.notNow'),
        onClick: closeModal,
      },
      {
        label: t('user.modals.loginRegisterOrg.registerOrgButton'),
        onClick: navigateToRegister,
      },
    ],
  };
};
