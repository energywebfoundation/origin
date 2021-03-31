import { useSelector } from 'react-redux';
import { isRole, Role, UserStatus } from '@energyweb/origin-backend-core';
import { fromUsersSelectors } from '../features';

export const useUserInfo = () => {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const userIsActive = user?.status === UserStatus.Active;
    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);
    return { isIssuer, userIsActiveAndPartOfOrg, user };
};
