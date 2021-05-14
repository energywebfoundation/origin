import { useOrganizationMembersData } from '@energyweb/origin-ui-organization-data';
import { createMembersTable } from '@energyweb/origin-ui-organization-logic';
import { useTranslation } from 'react-i18next';

export const useMembersPageEffects = () => {
  const { t } = useTranslation();
  const { members, isLoading } = useOrganizationMembersData();

  const tableData = createMembersTable(t, members);

  return { isLoading, tableData };
};
