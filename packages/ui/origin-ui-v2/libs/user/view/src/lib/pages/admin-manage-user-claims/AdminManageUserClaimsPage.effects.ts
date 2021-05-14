import { originDeviceRegistryClient } from '@energy-web/origin-ui-api-clients';

export const useAdminManageUserClaimsPageEffects = () => {
  originDeviceRegistryClient.useDeviceRegistryControllerGetAll();
};
