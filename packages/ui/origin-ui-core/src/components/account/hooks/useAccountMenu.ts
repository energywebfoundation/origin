import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { OriginFeature } from '@energyweb/utils-general';
import { fromUsersSelectors } from '../../../features';
import { IRECConnectForm } from '../../organization/IRec/IRECConnectForm';
import { OriginConfigurationContext } from '../../../PackageConfigurationProvider';
import { AccountSettings } from '../AccountSettings';
import { UserRegister } from '../UserRegister';
import { UserProfilePage } from '../UserProfilePage';
import { ConfirmEmail } from '../ConfirmEmail';

interface IAccountMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
}

export const useAccountMenu = (): IAccountMenuItem[] => {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const iRecAccount = useSelector(fromUsersSelectors.getIRecAccount);
    const enabledFeatures = useContext(OriginConfigurationContext)?.enabledFeatures;

    const isLoggedIn = Boolean(user);
    const organization = user?.organization;

    return [
        {
            key: 'settings',
            label: 'settings.navigation.settings',
            component: AccountSettings,
            show: true
        },
        {
            key: 'user-register',
            label: 'settings.navigation.registerUser',
            component: UserRegister,
            show: !isLoggedIn
        },
        {
            key: 'user-profile',
            label: 'settings.navigation.userProfile',
            component: UserProfilePage,
            show: isLoggedIn
        },
        {
            key: 'confirm-email',
            label: 'settings.navigation.confirmEmail',
            component: ConfirmEmail,
            show: false
        },
        {
            key: 'connect-irec',
            label: 'settings.navigation.connectIREC',
            component: IRECConnectForm,
            show:
                enabledFeatures?.includes(OriginFeature.IRec) &&
                enabledFeatures?.includes(OriginFeature.IRecConnect) &&
                organization &&
                Boolean(iRecAccount)
        }
    ];
};
