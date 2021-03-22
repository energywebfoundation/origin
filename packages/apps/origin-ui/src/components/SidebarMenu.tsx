import React, { useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Box, Grid, Tooltip, Theme, withStyles } from '@material-ui/core';
import { isRole, OrganizationStatus, Role, UserStatus } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import {
    getUserOffchain,
    useDeviceMenu,
    useCertificatesMenu,
    useOrganizationMenu,
    useAdminMenu,
    useAccountMenu
} from '@energyweb/origin-ui-core';
import { useExchangeMenu } from '@energyweb/exchange-ui-core';
import { useDeviceMenu as useIRecDeviceMenu } from '@energyweb/origin-ui-irec-core';
import { OriginConfigurationContext } from './OriginConfigurationContext';
import { useLinks } from '../routing';
import { SidebarSubMenu } from './SidebarSubMenu';

export enum ActiveMenuItem {
    Devices = 1,
    Certificates = 2,
    Exchange = 3,
    Organization = 4,
    Admin = 5,
    Settings = 6
}

export function SidebarMenu() {
    const user = useSelector(getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const userIsActive = user && user.status === UserStatus.Active;
    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);
    const { enabledFeatures, logo } = useContext(OriginConfigurationContext);
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState<ActiveMenuItem>(null);
    const location = useLocation();

    const {
        getDefaultLink,
        getDevicesLink,
        getCertificatesLink,
        getAccountLink,
        getOrganizationLink,
        getAdminLink,
        getExchangeLink
    } = useLinks();

    function setSidebarActiveItem(link) {
        const currentPath = link.pathname.split('/')[1].toString().toLowerCase();
        switch (currentPath) {
            case 'devices':
                return ActiveMenuItem.Devices;
            case 'certificates':
                return ActiveMenuItem.Certificates;
            case 'exchange':
                return ActiveMenuItem.Exchange;
            case 'organization':
                return ActiveMenuItem.Organization;
            case 'admin':
                return ActiveMenuItem.Admin;
            case 'account':
                return ActiveMenuItem.Settings;
        }
    }

    useEffect(() => {
        const activeItem = setSidebarActiveItem(location);
        if (activeTab !== activeItem) {
            setActiveTab(activeItem);
        }
    }, [location]);

    const irecDeviceMenuList = useIRecDeviceMenu();
    const deviceMenuList = useDeviceMenu();
    const certificateMenuList = useCertificatesMenu();
    const exchangeMenuList = useExchangeMenu();
    const organizationMenuList = useOrganizationMenu();
    const adminMenuList = useAdminMenu();
    const settingsMenuList = useAccountMenu();

    const openDevices = activeTab === ActiveMenuItem.Devices;
    const openCertificates = activeTab === ActiveMenuItem.Certificates;
    const openExchange = activeTab === ActiveMenuItem.Exchange;
    const openOrganization = activeTab === ActiveMenuItem.Organization;
    const openAdmin = activeTab === ActiveMenuItem.Admin;
    const openSettings = activeTab === ActiveMenuItem.Settings;

    const LightTooltip = withStyles((theme: Theme) => ({
        arrow: {
            color: theme.palette.primary.main
        },
        tooltip: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white
        }
    }))(Tooltip);

    const dotStyle = {
        backgroundColor: 'rgb(255, 215, 0)',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        display: 'inline-block',
        marginLeft: '4px'
    };

    return (
        <div className="SidebarMenu">
            <Box className="Logo">
                <NavLink to={getDefaultLink()}>{logo}</NavLink>
            </Box>
            <Grid className="userNameAndOrg">
                <Typography variant="h6">
                    {user?.status === UserStatus.Pending && (
                        <LightTooltip arrow title={t('user.popover.yourAccountIsPending')}>
                            <span data-cy="user-pending-badge" style={dotStyle} />
                        </LightTooltip>
                    )}
                    <span>{user ? `${user.firstName} ${user.lastName}` : ''}</span>
                </Typography>
                <Typography>
                    {user?.organization?.status === OrganizationStatus.Submitted && (
                        <LightTooltip arrow title={t('user.popover.yourOrganizationIsPending')}>
                            <span data-cy="organization-pending-badge" style={dotStyle} />
                        </LightTooltip>
                    )}
                    <span>{user?.organization ? `${user.organization.name}` : ''}</span>
                </Typography>
            </Grid>

            <Grid className="SidebarNavigation">
                <ul>
                    {enabledFeatures.includes(OriginFeature.Devices) && (
                        <>
                            <li className="mainMenu" data-cy="devices-menu">
                                <NavLink to={getDevicesLink()}>{t('header.devices')}</NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getDevicesLink()}
                                menuList={
                                    !enabledFeatures.includes(OriginFeature.IRecUIApp)
                                        ? deviceMenuList
                                        : irecDeviceMenuList
                                }
                                open={openDevices}
                            />
                        </>
                    )}

                    {((enabledFeatures.includes(OriginFeature.Certificates) &&
                        userIsActiveAndPartOfOrg) ||
                        isIssuer) && (
                        <>
                            <li className="mainMenu" data-cy="certificates-menu">
                                <NavLink to={getCertificatesLink()}>
                                    {t('header.certificates')}
                                </NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getCertificatesLink()}
                                menuList={certificateMenuList}
                                open={openCertificates}
                            />
                        </>
                    )}

                    {enabledFeatures.includes(OriginFeature.Exchange) && (
                        <>
                            <li className="mainMenu" data-cy="exchange-menu">
                                <NavLink to={getExchangeLink()}>{t('header.exchange')}</NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getExchangeLink()}
                                menuList={exchangeMenuList}
                                open={openExchange}
                            />
                        </>
                    )}

                    {isRole(user, Role.OrganizationAdmin, Role.Admin, Role.SupportAgent) && (
                        <>
                            <li className="mainMenu" data-cy="organizations-menu">
                                <NavLink to={getOrganizationLink()}>
                                    {t('header.organizations')}
                                </NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getOrganizationLink()}
                                menuList={organizationMenuList}
                                open={openOrganization}
                            />
                        </>
                    )}
                    {isRole(user, Role.Admin) && (
                        <>
                            <li className="mainMenu" data-cy="admin-menu">
                                <NavLink to={getAdminLink()}>{t('header.admin')}</NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getAdminLink()}
                                menuList={adminMenuList}
                                open={openAdmin}
                            />
                        </>
                    )}

                    {isRole(user, Role.SupportAgent) && (
                        <>
                            <li className="mainMenu" data-cy="support-agent-menu">
                                <NavLink to={getAdminLink()}>{t('header.supportAgent')}</NavLink>
                            </li>
                            <SidebarSubMenu
                                rootLink={getAdminLink()}
                                menuList={adminMenuList}
                                open={openAdmin}
                            />
                        </>
                    )}
                    <>
                        <li className="mainMenu" data-cy="settings-menu">
                            <NavLink to={getAccountLink()}>{t('settings.settings')}</NavLink>
                        </li>
                        <SidebarSubMenu
                            rootLink={getAccountLink()}
                            menuList={settingsMenuList}
                            open={openSettings}
                        />
                    </>
                </ul>
            </Grid>
        </div>
    );
}
