import { useTranslation } from 'react-i18next';
import { OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';
import {
  TUsePermissions,
  IPermissionRule,
  IPermissionReturnType,
  Requirement,
  RequirementList,
} from './types';

export const defaultRequirementList: RequirementList = [
  Requirement.IsLoggedIn,
  Requirement.IsActiveUser,
  Requirement.IsPartOfApprovedOrg,
  Requirement.HasExchangeDepositAddress,
];

export const usePermissionsLogic = ({
  user,
  exchangeDepositAddress,
  config = defaultRequirementList,
}: TUsePermissions): IPermissionReturnType => {
  const { t } = useTranslation();

  const predicateList: Record<Requirement, IPermissionRule> = {
    [Requirement.IsLoggedIn]: {
      label: t('general.requirements.haveToBeLoggedInUser'),
      passing: Boolean(user),
    },
    [Requirement.IsActiveUser]: {
      label: t('general.requirements.hasToBeActiveUser'),
      passing: user?.status === UserStatus.Active,
    },
    [Requirement.IsPartOfApprovedOrg]: {
      label: t('general.requirements.userHasToBePartOfApprovedOrganization'),
      passing:
        Boolean(user?.organization) &&
        user?.organization?.status === OrganizationStatus.Active,
    },
    [Requirement.HasExchangeDepositAddress]: {
      label: t('general.requirements.organizationHasToHaveExchangeDeposit'),
      passing: Boolean(exchangeDepositAddress),
    },
    [Requirement.HasOrganizationBlockchainAddress]: {
      label: t('general.requirements.organizationHasToHaveBlockchainAccount'),
      passing: Boolean(user?.organization?.blockchainAccountAddress),
    },
  };

  const title = t('general.requirements.requirementsTitle');
  const rules = config.map((requirement) => predicateList[requirement]);
  const canAccessPage = rules.every((r) => r.passing);

  const requirementsProps = {
    rules,
    title,
  };

  return {
    canAccessPage,
    requirementsProps,
  };
};
