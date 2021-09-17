import { TCreateDocsUploadForm } from './types';

export const createDocsUploadForm: TCreateDocsUploadForm = (t) => ({
  formTitle: t('organization.register.docsFormTitle'),
  formTitleVariant: 'h5',
  initialValues: {
    documentIds: [],
    signatoryDocumentIds: [],
  },
  fields: null,
  validationSchema: null,
  customStep: true,
  buttonText: t('general.buttons.submit'),
});
