import { NavLink } from 'react-router-dom';
import { SidebarSubMenu } from './SidebarSubMenu';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminMenu } from '@energyweb/origin-ui-core';
import { OriginFeature } from '@energyweb/utils-general';

interface IProps {
    adminPageUrl: string;
    isActive: boolean;
    enabledFeatures: OriginFeature[];
}
export const SidebarMenuSupportAgentSection = ({
    adminPageUrl,
    isActive,
    enabledFeatures = []
}: IProps): ReactElement => {
    const { t } = useTranslation();
    const adminMenuList = useAdminMenu();
    return (
        <>
            <li className="mainMenu">
                <NavLink to={adminPageUrl}>{t('header.supportAgent')}</NavLink>
            </li>
            <SidebarSubMenu
                enabledFeatures={enabledFeatures}
                rootLink={adminPageUrl}
                menuList={adminMenuList}
                open={isActive}
            />
        </>
    );
};
