import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import axios from 'axios';

import { getOrganizationMenu } from '@energyweb/origin-ui-organization-logic';
import { getDeviceMenu } from '@energyweb/origin-ui-device-logic';
import { getAccountMenu } from '@energyweb/origin-ui-user-logic';
import { getAdminMenu } from '@energyweb/origin-ui-user-logic';

import { useAuthIsAuthenticated } from '@energyweb/origin-ui-react-query-providers';
import { useAccount } from '@energyweb/origin-ui-user-view';

export const useAppContainerEffects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthIsAuthenticated();
  const accountData = useAccount();

  const orgMenu = getOrganizationMenu({
    t,
    showRegisterOrg: true,
    showMyOrg: true,
    showMembers: true,
    showInvitations: true,
    showInvite: true,
    showAllOrgs: true,
    showRegisterIRec: true,
  });
  const deviceMenu = getDeviceMenu({
    t,
    showAllDevices: true,
    showMapView: true,
    showMyDevices: true,
    showPendingDevices: true,
    showRegisterDevice: true,
    showDeviceImport: true,
  });
  const accountMenu = getAccountMenu({
    t,
    showSettings: true,
    showUserProfile: true,
  });
  const adminMenu = getAdminMenu({
    t,
    showClaims: true,
    showUsers: true,
  });

  const menuSections = [orgMenu, deviceMenu, accountMenu, adminMenu];

  // set backend url
  useEffect(() => {
    axios.interceptors.request.use((config) => {
      return {
        ...config,
        baseURL: process.env.NX_BACKEND_URL,
      };
    });
  }, []);

  return {
    navigate: (url: string) => {
      console.log(`navigate => (${url})`);
      navigate(url);
    },
    isAuthenticated,
    menuSections,
    accountData,
  };
};
