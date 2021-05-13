// @should be used but also adjusted with backend
// import { IFullOrganization } from '@energyweb/origin-backend-core';

import { DisabledFormData } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';
import { formatOrganizationBusinessType } from '../utils';

export const organizationViewLogic = (
  t: TFunction,
  organization: any
): DisabledFormData[] => [
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
];
