import { useOrganizationRegisterHandler } from '@energyweb/origin-ui-organization-data';
import { createRegisterOrganizationFormLogic } from '@energyweb/origin-ui-organization-logic';
import { RegisterOrgDocs } from '../../containers/file';
import { useTranslation } from 'react-i18next';

export const useRegisterPageEffects = () => {
  const { t } = useTranslation();
  const submitHandler = useOrganizationRegisterHandler();
  const formsLogic = createRegisterOrganizationFormLogic(t);

  const formsWithDocsUpload = formsLogic.forms.map((form) =>
    form.customStep
      ? {
          ...form,
          component: RegisterOrgDocs,
        }
      : form
  );

  const formData = {
    ...formsLogic,
    forms: formsWithDocsUpload,
    submitHandler,
  };

  return { formData };
};
