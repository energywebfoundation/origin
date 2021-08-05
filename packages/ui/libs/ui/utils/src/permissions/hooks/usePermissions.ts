import { useTranslation } from 'react-i18next';
import { OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';
import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { useAccountControllerGetAccount } from '@energyweb/exchange-react-query-client';
import { defaultRequirementList } from '../defaultRequirementList';
import {
  IPermissionRule,
  IPermissionReturnType,
  Requirement,
} from './../../types';

export const usePermissions = (
  config = defaultRequirementList
): IPermissionReturnType => {
  const { t } = useTranslation();

  const { data: userData, isLoading: userLoading } = useUserControllerMe();
  const { data: account, isLoading: exchangeAddressLoading } =
    useAccountControllerGetAccount();

  const exchangeDepositAddress = account?.address || '';
  const user = userData || null;
  const loading = userLoading || exchangeAddressLoading;

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

  const accessRules = config.map((requirement) => predicateList[requirement]);
  const canAccessPage = accessRules.every((r) => r.passing);

  return {
    canAccessPage,
    accessRules,
    loading,
  };
};
