import { useSidebarMenuEffects } from './hooks/useSidebarMenuEffects';
import React, { ReactElement } from 'react';
import { SidebarMenu } from '../../components/SidebarMenu';
import { useLinks, useUserInfo } from '@energyweb/origin-ui-core';

export const SidebarMenuContainer = (): ReactElement => {
    const {
        accountPageUrl,
        adminPageUrl,
        organizationPageUrl,
        certificatesPageUrl,
        defaultPageUrl,
        devicesPageUrl,
        exchangePageUrl
    } = useLinks();
    const {
        enabledFeatures,
        isSettingsTabActive,
        isOrganizationTabActive,
        isExchangeTabActive,
        isDevicesTabActive,
        isCertificatesTabActive,
        isAdminTabAcive
    } = useSidebarMenuEffects();
    const { user, isIssuer, userIsActiveAndPartOfOrg } = useUserInfo();
    return (
        <SidebarMenu
            tabStatusMap={{
                isSettingsTabActive,
                isOrganizationTabActive,
                isExchangeTabActive,
                isDevicesTabActive,
                isCertificatesTabActive,
                isAdminTabAcive
            }}
            user={user}
            userIsActiveAndPartOfOrg={userIsActiveAndPartOfOrg}
            isIssuer={isIssuer}
            enabledFeatures={enabledFeatures}
            linkPaths={{
                accountPageUrl,
                adminPageUrl,
                organizationPageUrl,
                certificatesPageUrl,
                defaultPageUrl,
                devicesPageUrl,
                exchangePageUrl
            }}
        />
    );
};
