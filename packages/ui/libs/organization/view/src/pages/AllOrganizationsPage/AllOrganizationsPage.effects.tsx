import { FullOrganizationInfoDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import {
  useAllOrganizations,
  useOrgApproveHandler,
} from '@energyweb/origin-ui-organization-data';
import { useAllOrganizationsTableLogic } from '@energyweb/origin-ui-organization-logic';
import { Check } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const useAllOrganizationsPageEffects = () => {
  const { allOrganizations, isLoading } = useAllOrganizations();
  const { t } = useTranslation();

  const approveHandler = useOrgApproveHandler();

  const actions = [
    {
      icon: <Check />,
      name: t('organization.all.approve'),
      onClick: (id: FullOrganizationInfoDTO['id']) => approveHandler(id),
    },
  ];
  const tableProps = useAllOrganizationsTableLogic({
    allOrganizations,
    isLoading,
    actions,
  });

  return tableProps;
};
