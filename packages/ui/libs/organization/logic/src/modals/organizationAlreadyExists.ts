import { useTranslation } from 'react-i18next';
import { TOrganizationAlreadyExistsLogic } from './types';

export const useOrganizationAlreadyExistsLogic: TOrganizationAlreadyExistsLogic = (
  setOpen
) => {
  const { t } = useTranslation();
  return {
    title: t('organization.modals.organizationAlreadyExists.title'),
    text: [
      t('organization.modals.organizationAlreadyExists.text1'),
      t('organization.modals.organizationAlreadyExists.text2'),
    ],
    buttons: [
      { label: t('general.buttons.ok'), onClick: () => setOpen(false) },
    ],
  };
};
