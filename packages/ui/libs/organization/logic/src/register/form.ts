import { TUseRegisterOrganizationFormLogic } from './types';
import { createOrgInfoForm } from './orgInfoForm';
import { createSignatoryInfoForm } from './signatoryInfoForm';
import { createDocsUploadForm } from './docsUpload';

export const createRegisterOrganizationFormLogic: TUseRegisterOrganizationFormLogic = (
  t
) => {
  return {
    heading: t('organization.register.formTitle'),
    forms: [
      createOrgInfoForm(t),
      createSignatoryInfoForm(t),
      createDocsUploadForm(t),
    ],
  };
};
