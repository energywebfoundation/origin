import { useSelector } from 'react-redux';
import { OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';
import { getUserOffchain, getExchangeDepositAddress } from '../features/users';
import { useTranslation } from '.';

export interface IPermissionRule {
    label: string;
    passing: boolean;
}

export interface IPermission {
    value: boolean;
    rules: IPermissionRule[];
}

export function usePermissions() {
    const user = useSelector(getUserOffchain);
    const exchangeAddress = useSelector(getExchangeDepositAddress);
    const { t } = useTranslation();

    const canAccessPage: IPermission = {
        value: false,
        rules: [
            {
                label: t('general.feedback.haveToBeLoggedInUser'),
                passing: Boolean(user)
            },
            {
                label: t('general.feedback.hasToBeActiveUser'),
                passing: user?.status === UserStatus.Active
            },
            {
                label: t('general.feedback.userHasToBePartOfApprovedOrganization'),
                passing:
                    Boolean(user?.organization) &&
                    user?.organization?.status === OrganizationStatus.Active
            },
            {
                label: t('general.feedback.organizationHasToHaveExchangeDeposit'),
                passing: Boolean(exchangeAddress)
            }
        ]
    };

    canAccessPage.value = canAccessPage.rules.every((r) => r.passing);

    return {
        canAccessPage
    };
}
