import { FullOrganizationInfoDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import { TableActionData } from '@energyweb/origin-ui-core';
import {
  useAllOrganizations,
  useOrgApproveHandler,
} from '@energyweb/origin-ui-user-data';
import { useAllOrganizationsTableLogic } from '@energyweb/origin-ui-user-logic';
import { Check } from '@mui/icons-material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const useAdminAllOrganizationsPageEffects = () => {
  const { allOrganizations, isLoading } = useAllOrganizations();
  const { t } = useTranslation();

  const { approveHandler, isMutating } = useOrgApproveHandler();

  const actions: TableActionData<FullOrganizationInfoDTO['id']>[] = [
    {
      icon: <Check />,
      name: t('organization.all.approve'),
      onClick: approveHandler,
      loading: isMutating,
    },
  ];
  const tableProps = useAllOrganizationsTableLogic({
    allOrganizations,
    isLoading,
    actions,
  });

  return tableProps;
};
