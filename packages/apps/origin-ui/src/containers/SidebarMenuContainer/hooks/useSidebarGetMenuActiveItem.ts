import { ActiveMenuItem } from '../../../components/SidebarMenu';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const useSidebarGetMenuActiveItem = (): ActiveMenuItem => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<ActiveMenuItem>(null);

    useEffect(() => {
        switch (location.pathname.split('/')[1].toString().toLowerCase()) {
            case 'devices':
                setActiveTab(ActiveMenuItem.Devices);
                return;
            case 'certificates':
                setActiveTab(ActiveMenuItem.Certificates);
                return;
            case 'exchange':
                setActiveTab(ActiveMenuItem.Exchange);
                return;
            case 'organization':
                setActiveTab(ActiveMenuItem.Organization);
                return;
            case 'admin':
                setActiveTab(ActiveMenuItem.Admin);
                return;
            case 'account':
                setActiveTab(ActiveMenuItem.Settings);
        }
    }, [location]);
    return activeTab;
};
