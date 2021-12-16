import { useParams } from 'react-router';
import { useAdminGetOrganizationById } from '@energyweb/origin-ui-user-data';
import { useAdminOrganizationViewLogic } from '@energyweb/origin-ui-user-logic';

export const useAdminOrganizationViewPageEffects = () => {
  const { id } = useParams();
  const { organizationLoading, organization } = useAdminGetOrganizationById(id);

  const { orgFormData, docsBlockHeading, companyProofData, signatoryData } =
    useAdminOrganizationViewLogic(organization);

  const showCompanyProofDocs = organization?.documentIds?.length;
  const showSignatoryIdDocs = organization?.signatoryDocumentIds?.length;
  const showDocuments = showCompanyProofDocs || showSignatoryIdDocs;
  const pageLoading = organizationLoading;

  return {
    pageLoading,
    orgFormData,
    docsBlockHeading,
    showDocuments,
    showCompanyProofDocs,
    showSignatoryIdDocs,
    companyProofData,
    signatoryData,
  };
};
