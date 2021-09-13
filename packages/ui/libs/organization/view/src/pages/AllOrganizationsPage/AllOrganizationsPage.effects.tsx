import { FullOrganizationInfoDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import { TableActionData } from '@energyweb/origin-ui-core';
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
