import { FullOrganizationInfoDTO } from '@energyweb/origin-backend-react-query-client';
import { DisabledFormData } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';
import { formatOrganizationBusinessType } from '../utils';

type TViewLogicReturnType = {
  orgViewHeading: string;
  orgData: DisabledFormData[];
  docsBlockHeading: string;
  companyProofBlockTitle: string;
  signatoryIdBlockTitle: string;
};

type TOrganizationViewLogic = (
  t: TFunction,
  organization: FullOrganizationInfoDTO
) => TViewLogicReturnType;

export const organizationViewLogic: TOrganizationViewLogic = (
  t,
  organization
) => ({
  orgViewHeading: t('organization.view.title'),
  orgData: [
    {
      label: t('organization.view.name'),
      value: organization.name,
    },
    {
      label: t('organization.view.address'),
      value: organization.address,
    },
    {
      label: t('organization.view.businessType'),
      value: formatOrganizationBusinessType(organization.businessType),
    },
    {
      label: t('organization.view.tradeRegistry'),
      value: organization.tradeRegistryCompanyNumber,
    },
    {
      label: t('organization.view.vat'),
      value: organization.tradeRegistryCompanyNumber,
    },
    {
      label: t('organization.view.signatoryName'),
      value: organization.signatoryFullName,
    },
    {
      label: t('organization.view.signatoryAddress'),
      value: organization.signatoryAddress,
    },
    {
      label: t('organization.view.signatoryEmail'),
      value: organization.signatoryEmail,
    },
    {
      label: t('organization.view.signatoryPhone'),
      value: organization.signatoryPhoneNumber,
    },
    {
      label: t('organization.view.status'),
      value: organization.status,
    },
  ],
  docsBlockHeading: t('organization.view.documents'),
  companyProofBlockTitle: t('organization.view.companyProof'),
  signatoryIdBlockTitle: t('organization.view.signatoryId'),
});
