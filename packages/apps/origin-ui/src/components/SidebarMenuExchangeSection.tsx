import { OriginFeature } from '@energyweb/utils-general';
import { NavLink } from 'react-router-dom';
import { SidebarSubMenu } from './SidebarSubMenu';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useExchangeMenu } from '@energyweb/exchange-ui-core';

interface IProps {
    enabledFeatures: OriginFeature[];
    isOpen: boolean;
    exchangePath: string;
}

export const SidebarMenuExchangeSection = memo(
    ({ enabledFeatures, isOpen, exchangePath }: IProps) => {
        const { t } = useTranslation();
        const exchangeMenuList = useExchangeMenu();
        return (
            enabledFeatures.includes(OriginFeature.Exchange) && (
                <>
                    <li data-cy="exchange-menu" className="mainMenu">
                        <NavLink to={exchangePath}>{t('header.exchange')}</NavLink>
                    </li>
                    <SidebarSubMenu
                        enabledFeatures={enabledFeatures}
                        rootLink={exchangePath}
                        menuList={exchangeMenuList}
                        open={isOpen}
                    />
                </>
            )
        );
    }
);

SidebarMenuExchangeSection.displayName = 'SidebarMenuExchangeSection';
