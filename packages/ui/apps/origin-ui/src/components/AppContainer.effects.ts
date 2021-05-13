import { useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { getOrganizationMenu } from '@energyweb/origin-ui-organization-logic';
import { getDeviceMenu } from '@energyweb/origin-ui-device-logic';

// SHOULD REMOVE THIS IS A TEMPORARY FIX TO NON BUILDING BACKEND CLIENT PACKAGE
import {
  AXIOS_INSTANCE,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';
import { OrgNavData, UserNavData } from '@energyweb/origin-ui-core';
import { OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';

export const useAppContainerEffects = () => {
  const { t } = useTranslation();
  const { data: user } = useUserControllerMe({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  // MOCK
  const token = localStorage.getItem('ACCESS_TOKEN');
  //set token for origin-backend-client axios_instance
  useEffect(() => {
    const interceptorId = AXIOS_INSTANCE.interceptors.request.use((config) => {
      return {
        ...config,
        headers: token
          ? {
              ...config.headers,
              Authorization: `Bearer ${token}`,
            }
          : config.headers,
      };
    });
    return () => {
      AXIOS_INSTANCE.interceptors.request.eject(interceptorId);
    };
  }, [token]);

  useEffect(() => {
    const interceptorId = axios.interceptors.request.use((config) => {
      return {
        ...config,
        headers: token
          ? {
              ...config.headers,
              Authorization: `Bearer ${token}`,
            }
          : config.headers,
      };
    });
    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, [token]);

  // set backend url
  useEffect(() => {
    axios.interceptors.request.use((config) => {
      return {
        ...config,
        baseURL: process.env.NX_BACKEND_URL,
      };
    });
  }, []);

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

  const userData: UserNavData = {
    username: user ? user.firstName + ' ' + user.lastName : '',
    userPending: user?.status === UserStatus.Pending,
    userTooltip: t('navigation.layout.userPendingTooltip'),
  };

  const orgData: OrgNavData = {
    orgName: user?.organization ? user.organization.name : '',
    orgPending: user?.organization?.status === OrganizationStatus.Submitted,
    orgTooltip: t('navigation.layout.orgPendingTooltip'),
  };

  const menuSections = [orgMenu, deviceMenu];
  return { menuSections, userData, orgData };
};
