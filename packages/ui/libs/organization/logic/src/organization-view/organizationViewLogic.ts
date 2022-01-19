import { FullOrganizationInfoDTO } from '@energyweb/origin-backend-react-query-client';
import { DisabledFormViewProps } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';
import { formatOrganizationBusinessType } from '../utils';

type TDocumentBlockData = {
  documents: string[];
  blockTitle: string;
  dataCy?: string;
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
        dataCy: 'organizationName',
      },
      {
        label: t('organization.view.regular.address'),
        value: organization.address,
        dataCy: 'organizationAddress',
      },
      {
        label: t('organization.view.regular.businessType'),
        value: formatOrganizationBusinessType(organization.businessType),
        dataCy: 'organizationBusinessType',
      },
      {
        label: t('organization.view.regular.tradeRegistry'),
        value: organization.tradeRegistryCompanyNumber,
        dataCy: 'organizationtTradeRegistry',
      },
      {
        label: t('organization.view.regular.vat'),
        value: organization.vatNumber,
        dataCy: 'organizationtVatNumber',
      },
      {
        label: t('organization.view.regular.signatoryName'),
        value: organization.signatoryFullName,
        dataCy: 'organizationtSignatoryName',
      },
      {
        label: t('organization.view.regular.signatoryAddress'),
        value: organization.signatoryAddress,
        dataCy: 'organizationtSignatoryAddress',
      },
      {
        label: t('organization.view.regular.signatoryEmail'),
        value: organization.signatoryEmail,
        dataCy: 'organizationtSignatoryEmail',
      },
      {
        label: t('organization.view.regular.signatoryPhone'),
        value: organization.signatoryPhoneNumber,
        dataCy: 'organizationtSignatoryPhoneNumber',
      },
      {
        label: t('organization.view.regular.status'),
        value: organization.status,
        dataCy: 'organizationtStatus',
      },
    ],
  },
  docsBlockHeading: t('organization.view.regular.documents'),
  companyProofData: {
    documents: organization.documentIds,
    blockTitle: t('organization.view.regular.companyProof'),
    dataCy: 'downloadCompanyProof',
  },
  signatoryData: {
    documents: organization.signatoryDocumentIds,
    blockTitle: t('organization.view.regular.signatoryId'),
    dataCy: 'downloadSignatoryId',
  },
});
