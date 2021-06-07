import { useUpdateBlockchainAddress } from '@energyweb/origin-ui-user-data-access';
import { useOrganizationBlockchainAddressLogic } from '@energyweb/origin-ui-user-logic';
import { useState } from 'react';

export const useOrganizationBlockchainAddressEffects = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const api = useUpdateBlockchainAddress(setIsUpdating);
  const logic = useOrganizationBlockchainAddressLogic();

  return { ...api, isUpdating, ...logic };
};
