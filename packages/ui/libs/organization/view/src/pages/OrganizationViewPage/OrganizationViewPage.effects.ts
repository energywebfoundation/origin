import { useTranslation } from 'react-i18next';
import { useMyOrganizationData } from '@energyweb/origin-ui-organization-data';
import { organizationViewLogic } from '@energyweb/origin-ui-organization-logic';
import { DisabledFormViewProps } from '@energyweb/origin-ui-core';
import { DownloadOrgDocsProps } from '../../containers';

export const useOrganizationViewPageEffects = () => {
  const { t } = useTranslation();
  const { isLoading: isOrgLoading, organization } = useMyOrganizationData();

  const {
    orgData,
    orgViewHeading,
    docsBlockHeading,
    companyProofBlockTitle,
    signatoryIdBlockTitle,
  } = !!organization && organizationViewLogic(t, organization);

  const showCompanyProofDocs = organization?.documentIds?.length;
  const showSignatoryIdDocs = organization?.signatoryDocumentIds?.length;
  const showDocuments = showCompanyProofDocs || showSignatoryIdDocs;

  const companyProofData: DownloadOrgDocsProps = {
    documents: organization?.documentIds,
    blockTitle: companyProofBlockTitle,
  };

  const signatoryData: DownloadOrgDocsProps = {
    documents: organization?.signatoryDocumentIds,
    blockTitle: signatoryIdBlockTitle,
  };

  const orgFormData: DisabledFormViewProps = {
    data: orgData,
    heading: orgViewHeading,
  };

  return {
    isOrgLoading,
    orgFormData,
    docsBlockHeading,
    showDocuments,
    showCompanyProofDocs,
    showSignatoryIdDocs,
    companyProofData,
    signatoryData,
  };
};
