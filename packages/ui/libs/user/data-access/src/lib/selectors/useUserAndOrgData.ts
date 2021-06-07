import { KYCStatus, UserStatus } from '@energyweb/origin-backend-core';
import {
  OrganizationStatus,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';
import { OrgNavData, UserNavData } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

export const useUserAndOrgData = (
  user: UserDTO
): { userData: UserNavData; orgData: OrgNavData } => {
  const { t } = useTranslation();
  return {
    userData: {
      username: `${user?.firstName} ${user?.lastName}`,
      userPending:
        user?.kycStatus === KYCStatus.Pending ||
        user?.status === UserStatus.Pending,
      userTooltip: t('navigation.layout.userPendingTooltip'),
    },
    orgData: {
      orgName: user?.organization?.name,
      orgPending:
        user?.organization &&
        user.organization.status !== OrganizationStatus.Active,
      orgTooltip: t('navigation.layout.orgPendingTooltip'),
    },
  };
};
