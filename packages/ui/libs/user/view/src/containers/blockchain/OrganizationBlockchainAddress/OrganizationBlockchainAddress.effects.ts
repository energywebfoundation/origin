import { useUpdateBlockchainAddress } from '@energyweb/origin-ui-user-data';
import { useOrganizationBlockchainAddressLogic } from '@energyweb/origin-ui-user-logic';
import { useState } from 'react';
import { useUserAppEnv } from '../../../context';

export const useOrganizationBlockchainAddressEffects = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { registrationMessage } = useUserAppEnv();

  const api = useUpdateBlockchainAddress(registrationMessage, setIsUpdating);
  const logic = useOrganizationBlockchainAddressLogic();

  return { ...api, isUpdating, ...logic };
};
