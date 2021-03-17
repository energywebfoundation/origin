import { useTranslation } from 'react-i18next';
import { AdminUsersTable } from './AdminUsersTable';
import { AdminUserView } from './AdminUserView';
import { AdminClaimsTable } from './AdminClaimsTable';

interface IAdminMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
}

export const useAdminMenu = (): IAdminMenuItem[] => {
    const { t } = useTranslation();

    return [
        {
            key: 'manage-user',
            label: t('navigation.admin.users'),
            component: AdminUsersTable,
            show: true
        },
        {
            key: 'claims',
            label: t('navigation.admin.claims'),
            component: AdminClaimsTable,
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
