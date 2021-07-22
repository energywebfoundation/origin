import { OrganizationStatus } from '@energyweb/origin-backend-core';
import { Countries } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { TFormatAllOrgs, TUseAllOrganizationsTableLogic } from './types';

const formatOrganizations: TFormatAllOrgs = ({ allOrganizations, actions }) => {
  return allOrganizations?.map((org) => ({
    id: org.id,
    name: org.name,
    country: Countries.find((country) => country.code === org.country)?.name,
    tradeRegistryNumber: org.tradeRegistryCompanyNumber,
    status: org.status,
    actions: org.status === OrganizationStatus.Submitted ? actions : undefined,
  }));
};

export const useAllOrganizationsTableLogic: TUseAllOrganizationsTableLogic = ({
  allOrganizations,
  actions,
  isLoading,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      name: t('organization.all.name'),
      country: t('organization.all.country'),
      tradeRegistryNumber: t('organization.all.tradeRegistryNumber'),
      status: t('organization.all.status'),
      actions: '',
    },
    pageSize: 20,
    loading: isLoading,
    data: formatOrganizations({ allOrganizations, actions }) ?? [],
  };
};
