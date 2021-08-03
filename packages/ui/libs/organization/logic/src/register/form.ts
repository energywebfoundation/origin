import { TUseRegisterOrganizationFormLogic } from './types';
import { createOrgInfoForm } from './orgInfoForm';
import { createSignatoryInfoForm } from './signatoryInfoForm';
import { createDocsUploadForm } from './docsUpload';
import { useTranslation } from 'react-i18next';

export const useRegisterOrganizationFormLogic: TUseRegisterOrganizationFormLogic =
  () => {
    const { t } = useTranslation();
    return {
      heading: t('organization.register.formTitle'),
      forms: [
        createOrgInfoForm(t),
        createSignatoryInfoForm(t),
        createDocsUploadForm(t),
      ],
      backButtonText: t('general.buttons.back'),
    };
  };
