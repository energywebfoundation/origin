import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { getRoleChangedLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useRoleChangedEffects = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { data: user } = useUserControllerMe();

  const orgName = user?.organization?.name;
  const role = user?.rights;

  // mocks
  const ownerName = 'James Brown';
  const isIRecEnabled = true;

  const modalLogic = getRoleChangedLogic({
    t,
    setOpen,
    role,
    orgName,
    ownerName,
    isIRecEnabled,
  });

  return { open, ...modalLogic };
};
