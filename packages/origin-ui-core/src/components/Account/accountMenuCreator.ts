import { IUser } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { AccountSettings } from './AccountSettings';
import { UserRegister } from './UserRegister';
import { UserProfile } from './UserProfile';
import { ConfirmEmail } from './ConfirmEmail';
import { IRECConnectForm } from '../Organization/IRECConnectForm';
import { Registration } from '../../utils/irec';

interface IAccountMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
}

export const accountMenuCreator = (
    user: IUser,
    enabledFeatures: OriginFeature[],
    iRecAccount: Registration[] = null
): IAccountMenuItem[] => {
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
            component: UserProfile,
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
                enabledFeatures.includes(OriginFeature.IRec) &&
                enabledFeatures.includes(OriginFeature.IRecConnect) &&
                organization &&
                Boolean(iRecAccount)
        }
    ];
};
