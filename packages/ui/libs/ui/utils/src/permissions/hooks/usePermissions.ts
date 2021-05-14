import {
  IUser,
  OrganizationStatus,
  UserStatus,
} from '@energyweb/origin-backend-core';
import { defaultRequirementList } from '../defaultRequirementList';
import { IPermission, IPermissionRule, Requirement } from './../../types';

export function usePermissions(
  user: IUser,
  config = defaultRequirementList,
  exchangeDepositAddress: string,
  t: (translationKey: string) => string
): { canAccessPage: IPermission } {
  const predicateList: Record<Requirement, IPermissionRule> = {
    [Requirement.IsLoggedIn]: {
      label: t('general.feedback.haveToBeLoggedInUser'),
      passing: Boolean(user),
    },
    [Requirement.IsActiveUser]: {
      label: t('general.feedback.hasToBeActiveUser'),
      passing: user?.status === UserStatus.Active,
    },
    [Requirement.IsPartOfApprovedOrg]: {
      label: t('general.feedback.userHasToBePartOfApprovedOrganization'),
      passing:
        Boolean(user?.organization) &&
        user?.organization?.status === OrganizationStatus.Active,
    },
    [Requirement.HasExchangeDepositAddress]: {
      label: t('general.feedback.organizationHasToHaveExchangeDeposit'),
      passing: Boolean(exchangeDepositAddress),
    },
    [Requirement.HasUserBlockchainAddress]: {
      label: t('general.feedback.userHasToHaveBlockchainAccount'),
      passing: Boolean(user?.blockchainAccountAddress),
    },
  };

  const canAccessPage: IPermission = {
    value: false,
    rules: config.map((requirement) => predicateList[requirement]),
  };

  canAccessPage.value = canAccessPage.rules.every((r) => r.passing);

  return {
    canAccessPage,
  };
}
