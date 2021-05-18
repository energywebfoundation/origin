import { UploadedFile } from '@energyweb/origin-ui-core';
import { fileUploadHandler } from '@energyweb/origin-ui-organization-data';
import { DocsUploadFormValues } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useRegisterOrgDocsEffects = () => {
  const [companyProofs, setCompanyProofs] = useState<UploadedFile[]>([]);
  const [signatoryId, setSignatoryId] = useState<UploadedFile[]>([]);

  const values: DocsUploadFormValues = {
    documentIds: companyProofs
      .filter((doc) => !doc.removed)
      .map((doc) => doc.uploadedName),
    signatoryDocumentIds: signatoryId
      .filter((doc) => !doc.removed)
      .map((doc) => doc.uploadedName),
  };
  const { t } = useTranslation();

  const uploadText = t('file.upload.dropOrClick');
  const companyProofHeading = t(
    'organization.register.companyProofDocsHeading'
  );
  const signatoryIdTHeading = t(
    'organization.register.companyProofDocsHeading'
  );

  const uploadFunction = fileUploadHandler;
  const onCompanyProofsChange = (newValues) => setCompanyProofs(newValues);
  const onSignatoryIdChange = (newValues) => setSignatoryId(newValues);

  const buttonDisabled = companyProofs.length < 1 || signatoryId.length < 1;
  const buttonText = t('general.buttons.submit');

  return {
    values,
    uploadText,
    uploadFunction,
    onCompanyProofsChange,
    companyProofHeading,
    onSignatoryIdChange,
    signatoryIdTHeading,
    buttonDisabled,
    buttonText,
  };
};
