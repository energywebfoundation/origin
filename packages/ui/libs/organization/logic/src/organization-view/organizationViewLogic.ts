import { FullOrganizationInfoDTO } from '@energyweb/origin-backend-react-query-client';
import { DisabledFormViewProps } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';
import { formatOrganizationBusinessType } from '../utils';

type TDocumentBlockData = {
  documents: string[];
  blockTitle: string;
};

type TViewLogicReturnType = {
  orgFormData: DisabledFormViewProps;
  docsBlockHeading: string;
  companyProofData: TDocumentBlockData;
  signatoryData: TDocumentBlockData;
};

type TOrganizationViewLogic = (
  t: TFunction,
  organization: FullOrganizationInfoDTO
) => TViewLogicReturnType;

export const getOrganizationViewLogic: TOrganizationViewLogic = (
  t,
  organization
) => ({
  orgFormData: {
    heading: t('organization.view.regular.title'),
    data: [
      {
        label: t('organization.view.regular.name'),
        value: organization.name,
      },
      {
        label: t('organization.view.regular.address'),
        value: organization.address,
      },
      {
        label: t('organization.view.regular.businessType'),
        value: formatOrganizationBusinessType(organization.businessType),
      },
      {
        label: t('organization.view.regular.tradeRegistry'),
        value: organization.tradeRegistryCompanyNumber,
      },
      {
        label: t('organization.view.regular.vat'),
        value: organization.tradeRegistryCompanyNumber,
      },
      {
        label: t('organization.view.regular.signatoryName'),
        value: organization.signatoryFullName,
      },
      {
        label: t('organization.view.regular.signatoryAddress'),
        value: organization.signatoryAddress,
      },
      {
        label: t('organization.view.regular.signatoryEmail'),
        value: organization.signatoryEmail,
      },
      {
        label: t('organization.view.regular.signatoryPhone'),
        value: organization.signatoryPhoneNumber,
      },
      {
        label: t('organization.view.regular.status'),
        value: organization.status,
      },
    ],
  },
  docsBlockHeading: t('organization.view.regular.documents'),
  companyProofData: {
    documents: organization.documentIds,
    blockTitle: t('organization.view.regular.companyProof'),
  },
  signatoryData: {
    documents: organization.signatoryDocumentIds,
    blockTitle: t('organization.view.regular.signatoryId'),
  },
});
