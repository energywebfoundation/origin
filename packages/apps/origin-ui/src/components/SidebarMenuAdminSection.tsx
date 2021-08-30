import { NavLink } from 'react-router-dom';
import { SidebarSubMenu } from './SidebarSubMenu';
import React, { memo, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminMenu } from '@energyweb/origin-ui-core';
import { OriginFeature } from '@energyweb/utils-general';

interface IProps {
    adminPageUrl: string;
    isOpen: boolean;
    enabledFeatures: OriginFeature[];
}
export const SidebarMenuAdminSection = memo(
    ({ adminPageUrl, isOpen, enabledFeatures = [] }: IProps): ReactElement => {
        const { t } = useTranslation();
        const adminMenuList = useAdminMenu();
        return (
            <>
                <li className="mainMenu">
                    <NavLink to={adminPageUrl}>{t('header.admin')}</NavLink>
                </li>
                <SidebarSubMenu
                    rootLink={adminPageUrl}
                    enabledFeatures={enabledFeatures}
                    menuList={adminMenuList}
                    open={isOpen}
                />
            </>
        );
    }
);

SidebarMenuAdminSection.displayName = 'SidebarMenuAdminSection';
