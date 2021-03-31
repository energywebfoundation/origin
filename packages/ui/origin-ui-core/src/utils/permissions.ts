import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';
import { fromUsersSelectors } from '../features';

export interface IPermissionRule {
    label: string;
    passing: boolean;
}

export interface IPermission {
    value: boolean;
    rules: IPermissionRule[];
}

export enum Requirement {
    IsLoggedIn,
    IsActiveUser,
    IsPartOfApprovedOrg,
    HasExchangeDepositAddress,
    HasUserBlockchainAddress
}

type Requirements = Requirement[];

const DefaultRequirements: Requirements = [
    Requirement.IsLoggedIn,
    Requirement.IsActiveUser,
    Requirement.IsPartOfApprovedOrg,
    Requirement.HasExchangeDepositAddress
];

export function usePermissions(config = DefaultRequirements): { canAccessPage: IPermission } {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const exchangeAddress = useSelector(fromUsersSelectors.getExchangeDepositAddress);
    const { t } = useTranslation();

    const tests: Record<Requirement, IPermissionRule> = {
        [Requirement.IsLoggedIn]: {
            label: t('general.feedback.haveToBeLoggedInUser'),
            passing: Boolean(user)
        },
        [Requirement.IsActiveUser]: {
            label: t('general.feedback.hasToBeActiveUser'),
            passing: user?.status === UserStatus.Active
        },
        [Requirement.IsPartOfApprovedOrg]: {
            label: t('general.feedback.userHasToBePartOfApprovedOrganization'),
            passing:
                Boolean(user?.organization) &&
                user?.organization?.status === OrganizationStatus.Active
        },
        [Requirement.HasExchangeDepositAddress]: {
            label: t('general.feedback.organizationHasToHaveExchangeDeposit'),
            passing: Boolean(exchangeAddress)
        },
        [Requirement.HasUserBlockchainAddress]: {
            label: t('general.feedback.userHasToHaveBlockchainAccount'),
            passing: Boolean(user?.blockchainAccountAddress)
        }
    };

    const canAccessPage: IPermission = {
        value: false,
        rules: config.map((r) => tests[r])
    };

    canAccessPage.value = canAccessPage.rules.every((r) => r.passing);

    return {
        canAccessPage
    };
}
