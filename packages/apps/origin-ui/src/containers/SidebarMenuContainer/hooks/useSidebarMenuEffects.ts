import { useContext, useMemo } from 'react';
import { OriginConfigurationContext } from '../../../components/OriginConfigurationContext';
import { ActiveMenuItem } from '../../../components/SidebarMenu';
import { useSidebarGetMenuActiveItem } from './useSidebarGetMenuActiveItem';

export const useSidebarMenuEffects = () => {
    const { enabledFeatures } = useContext(OriginConfigurationContext);

    const activeTab = useSidebarGetMenuActiveItem();

    const isDevicesTabActive = activeTab === ActiveMenuItem.Devices;
    const isCertificatesTabActive = activeTab === ActiveMenuItem.Certificates;
    const isExchangeTabActive = activeTab === ActiveMenuItem.Exchange;
    const isOrganizationTabActive = activeTab === ActiveMenuItem.Organization;
    const isAdminTabAcive = activeTab === ActiveMenuItem.Admin;
    const isSettingsTabActive = activeTab === ActiveMenuItem.Settings;

    return useMemo(
        () => ({
            isDevicesTabActive,
            isCertificatesTabActive,
            isExchangeTabActive,
            isOrganizationTabActive,
            isAdminTabAcive,
            isSettingsTabActive,
            enabledFeatures
        }),
        [activeTab]
    );
};
