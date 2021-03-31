import { NavLink } from 'react-router-dom';
import { SidebarSubMenu } from './SidebarSubMenu';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OriginFeature } from '@energyweb/utils-general';
import { useAccountMenu } from '@energyweb/origin-ui-core';

interface IProps {
    accountPageUrl: string;
    isActive: boolean;
    enabledFeatures: OriginFeature[];
}
export const SidebarMenuSettingsSection = ({
    enabledFeatures = [],
    accountPageUrl,
    isActive
}: IProps) => {
    const { t } = useTranslation();
    const menuList = useAccountMenu();
    return (
        <>
            <li className="mainMenu">
                <NavLink to={accountPageUrl}>{t('settings.settings')}</NavLink>
            </li>
            <SidebarSubMenu
                enabledFeatures={enabledFeatures}
                rootLink={accountPageUrl}
                menuList={menuList}
                open={isActive}
            />
        </>
    );
};
