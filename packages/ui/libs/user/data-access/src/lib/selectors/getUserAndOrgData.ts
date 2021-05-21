import { KYCStatus, UserStatus } from '@energyweb/origin-backend-core';
import { OrgNavData, UserNavData } from '@energyweb/origin-ui-core';
import { IAccountContextState } from '@energyweb/origin-ui-user-view';

export const getUserAndOrgData = (
  accountContext: IAccountContextState
): { userData: UserNavData; orgData: OrgNavData } => {
  if (
    accountContext?.isUserAccountDataFetched &&
    accountContext.userAccountData
  ) {
    const { userAccountData } = accountContext;
    const userPending =
      userAccountData.kycStatus === KYCStatus.Pending ||
      userAccountData.status === UserStatus.Pending;
    return {
      userData: {
        username: `${userAccountData.firstName} ${userAccountData.lastName}`,
        userPending,
        userTooltip: '',
      },
      orgData: {
        orgName: userAccountData.organization?.name,
        orgPending: false,
        orgTooltip: '',
      },
    };
  } else return { userData: null, orgData: null };
};
