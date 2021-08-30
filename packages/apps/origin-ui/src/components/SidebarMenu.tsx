import React, { ReactElement } from 'react';
import { Grid } from '@material-ui/core';
import { isRole as hasRole, IUser, Role } from '@energyweb/origin-backend-core';
import { IOriginConfiguration } from './OriginConfigurationContext';
import { UsernameAndOrg } from './UsernameAndOrg';
import { SidebarMenuOrganizationSection } from './SidebarMenuOrganizationSection';
import { SidebarMenuAdminSection } from './SidebarMenuAdminSection';
import { SidebarMenuSupportAgentSection } from './SidebarMenuSupportAgentSection';
import { SidebarMenuDevicesSection } from './SidebarMenuDevicesSection';
import { SidebarMenuCertificatesSection } from './SidebarMenuCertificatesSection';
import { SidebarMenuExchangeSection } from './SidebarMenuExchangeSection';
import { SidebarMenuSettingsSection } from './SidebarMenuSettingsSection';
import { SidebarMenuHomeLink } from './SidebarMenuHomeLink';

export enum ActiveMenuItem {
    Devices = 1,
    Certificates = 2,
    Exchange = 3,
    Organization = 4,
    Admin = 5,
    Settings = 6
}

interface IProps {
    userIsActiveAndPartOfOrg: boolean;
    enabledFeatures: IOriginConfiguration['enabledFeatures'];
    isIssuer: boolean;
    user: IUser;
    tabStatusMap: {
        isAdminTabAcive: boolean;
        isCertificatesTabActive: boolean;
        isDevicesTabActive: boolean;
        isExchangeTabActive: boolean;
        isOrganizationTabActive: boolean;
        isSettingsTabActive: boolean;
    };
    linkPaths: {
        defaultPageUrl: string;
        devicesPageUrl: string;
        certificatesPageUrl: string;
        accountPageUrl: string;
        organizationPageUrl: string;
        adminPageUrl: string;
        exchangePageUrl: string;
    };
}

export const SidebarMenu = (props: IProps): ReactElement => {
    const {
        linkPaths,
        tabStatusMap,
        user,
        enabledFeatures,
        userIsActiveAndPartOfOrg,
        isIssuer
    } = props;

    return (
        <div className="SidebarMenu">
            <SidebarMenuHomeLink defaultPageUrl={linkPaths.defaultPageUrl} />
            <UsernameAndOrg />
            <Grid className="SidebarNavigation">
                <ul>
                    <SidebarMenuDevicesSection
                        enabledFeatures={enabledFeatures}
                        devicesPath={linkPaths.devicesPageUrl}
                        isOpen={tabStatusMap.isDevicesTabActive}
                    />
                    <SidebarMenuCertificatesSection
                        userIsActiveAndPartOfOrg={userIsActiveAndPartOfOrg}
                        enabledFeatures={enabledFeatures}
                        isUserIssuer={isIssuer}
                        certificatesPath={linkPaths.certificatesPageUrl}
                        isOpen={tabStatusMap.isCertificatesTabActive}
                    />

                    <SidebarMenuExchangeSection
                        enabledFeatures={enabledFeatures}
                        isOpen={tabStatusMap.isExchangeTabActive}
                        exchangePath={linkPaths.exchangePageUrl}
                    />
                    {hasRole(user, Role.OrganizationAdmin, Role.Admin, Role.SupportAgent) && (
                        <SidebarMenuOrganizationSection
                            enabledFeatures={enabledFeatures}
                            organizationPageUrl={linkPaths.organizationPageUrl}
                            isOpen={tabStatusMap.isOrganizationTabActive}
                        />
                    )}
                    {hasRole(user, Role.Admin) && (
                        <SidebarMenuAdminSection
                            enabledFeatures={enabledFeatures}
                            adminPageUrl={linkPaths.adminPageUrl}
                            isOpen={tabStatusMap.isAdminTabAcive}
                        />
                    )}

                    {hasRole(user, Role.SupportAgent) && (
                        <SidebarMenuSupportAgentSection
                            enabledFeatures={enabledFeatures}
                            isActive={tabStatusMap.isAdminTabAcive}
                            adminPageUrl={linkPaths.adminPageUrl}
                        />
                    )}
                    <SidebarMenuSettingsSection
                        enabledFeatures={enabledFeatures}
                        accountPageUrl={linkPaths.accountPageUrl}
                        isActive={tabStatusMap.isSettingsTabActive}
                    />
                </ul>
            </Grid>
        </div>
    );
};

SidebarMenu.displayName = 'SidebarMenu';
