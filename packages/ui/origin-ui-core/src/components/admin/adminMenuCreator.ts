import { TFunction } from 'i18next';
import { AdminUsersTable } from './AdminUsersTable';
import { AdminUserView } from './AdminUserView';

interface IAdminMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
}

export const adminMenuCreator = (t: TFunction): IAdminMenuItem[] => {
    return [
        {
            key: 'manage-user',
            label: t('navigation.admin.users'),
            component: AdminUsersTable,
            show: true
        },
        {
            key: 'user-update',
            label: 'Update',
            component: AdminUserView,
            show: false
        }
    ];
};
