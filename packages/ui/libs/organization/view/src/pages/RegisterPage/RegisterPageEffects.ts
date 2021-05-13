import { useOrganizationRegisterHandler } from '@energyweb/origin-ui-organization-data';
import { createRegisterOrganizationFormLogic } from '@energyweb/origin-ui-organization-logic';
import { useTranslation } from 'react-i18next';

export const useRegisterPageEffects = () => {
  const { t } = useTranslation();
  const submitHandler = useOrganizationRegisterHandler();
  const formsLogic = createRegisterOrganizationFormLogic(t);

  const formData = {
    ...formsLogic,
    submitHandler,
  };

  return { formData };
};
