import { KYCStatus, UserStatus } from '@energyweb/origin-backend-core';
import {
  OrganizationStatus,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';
import { OrgNavData, UserNavData } from '@energyweb/origin-ui-core';

export const getUserAndOrgData = (
  user: UserDTO
): { userData: UserNavData; orgData: OrgNavData } => {
  const userPending =
    user?.kycStatus === KYCStatus.Pending ||
    user?.status === UserStatus.Pending;
  return {
    userData: {
      username: `${user?.firstName} ${user?.lastName}`,
      userPending,
      userTooltip: '',
    },
    orgData: {
      orgName: user?.organization?.name,
      orgPending: user?.organization?.status !== OrganizationStatus.Active,
      orgTooltip: '',
    },
  };
};
