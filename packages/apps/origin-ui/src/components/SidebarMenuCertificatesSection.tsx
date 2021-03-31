import React, { memo } from 'react';
import { OriginFeature } from '@energyweb/utils-general';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { SidebarSubMenu } from './SidebarSubMenu';
import { useCertificatesMenu } from '@energyweb/origin-ui-core';

interface IProps {
    userIsActiveAndPartOfOrg: boolean;
    enabledFeatures: OriginFeature[];
    isUserIssuer: boolean;
    certificatesPath: string;
    isOpen: boolean;
}

export const SidebarMenuCertificatesSection = memo((props: IProps) => {
    const { t } = useTranslation();
    const {
        userIsActiveAndPartOfOrg,
        enabledFeatures,
        isUserIssuer,
        certificatesPath,
        isOpen
    } = props;

    const certificateMenuList = useCertificatesMenu();

    return (
        ((enabledFeatures.includes(OriginFeature.Certificates) && userIsActiveAndPartOfOrg) ||
            isUserIssuer) && (
            <>
                <li className="mainMenu">
                    <NavLink to={certificatesPath}>{t('header.certificates')}</NavLink>
                </li>
                <SidebarSubMenu
                    enabledFeatures={enabledFeatures}
                    rootLink={certificatesPath}
                    menuList={certificateMenuList}
                    open={isOpen}
                />
            </>
        )
    );
});

SidebarMenuCertificatesSection.displayName = 'SidebarMenuCertificatesSection';
