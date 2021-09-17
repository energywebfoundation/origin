import { useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

enum ActiveMenuItem {
  Device = 1,
  Certificate = 2,
  Exchange = 3,
  Organization = 4,
  Admin = 5,
  Account = 6,
}

const useGetActiveTabFromLocation = (): ActiveMenuItem => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<ActiveMenuItem>(null);

  useEffect(() => {
    switch (location.pathname.split('/')[1].toString().toLowerCase()) {
      case 'device':
        setActiveTab(ActiveMenuItem.Device);
        return;
      case 'certificate':
        setActiveTab(ActiveMenuItem.Certificate);
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
        setActiveTab(ActiveMenuItem.Account);
    }
  }, [location]);
  return activeTab;
};

export const useActiveMenuTab = () => {
  const activeTab = useGetActiveTabFromLocation();

  const isDeviceTabActive = activeTab === ActiveMenuItem.Device;
  const isCertificateTabActive = activeTab === ActiveMenuItem.Certificate;
  const isExchangeTabActive = activeTab === ActiveMenuItem.Exchange;
  const isOrganizationTabActive = activeTab === ActiveMenuItem.Organization;
  const isAdminTabAcive = activeTab === ActiveMenuItem.Admin;
  const isAccountTabActive = activeTab === ActiveMenuItem.Account;

  return useMemo(
    () => ({
      isDeviceTabActive,
      isCertificateTabActive,
      isExchangeTabActive,
      isOrganizationTabActive,
      isAdminTabAcive,
      isAccountTabActive,
    }),
    [activeTab]
  );
};
