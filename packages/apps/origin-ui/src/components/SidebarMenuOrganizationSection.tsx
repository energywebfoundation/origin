import { NavLink } from 'react-router-dom';
import { SidebarSubMenu } from './SidebarSubMenu';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganizationMenu } from '@energyweb/origin-ui-core';
import { OriginFeature } from '@energyweb/utils-general';

interface IProps {
    organizationPageUrl: string;
    isOpen: boolean;
    enabledFeatures: OriginFeature[];
}

export const SidebarMenuOrganizationSection = memo(
    ({ enabledFeatures = [], organizationPageUrl, isOpen }: IProps) => {
        const { t } = useTranslation();
        const organizationMenuList = useOrganizationMenu();
        return (
            <>
                <li className="mainMenu">
                    <NavLink to={organizationPageUrl}>{t('header.organizations')}</NavLink>
                </li>
                <SidebarSubMenu
                    enabledFeatures={enabledFeatures}
                    rootLink={organizationPageUrl}
                    menuList={organizationMenuList}
                    open={isOpen}
                />
            </>
        );
    }
);

SidebarMenuOrganizationSection.displayName = 'SidebarMenuOrganizationSection';
