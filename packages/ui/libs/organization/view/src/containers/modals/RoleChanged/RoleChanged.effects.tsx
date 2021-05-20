import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { getRoleChangedLogic } from '@energyweb/origin-ui-organization-logic';
import { useTranslation } from 'react-i18next';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../../context';

export const useRoleChangedEffects = () => {
  const { roleChanged: open } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();

  const closeModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_ROLE_CHANGED,
      payload: false,
    });
  };

  const { t } = useTranslation();
  const { data: user } = useUserControllerMe();

  const orgName = user?.organization?.name;
  const role = user?.rights;

  // mocks
  const ownerName = 'James Brown';
  const isIRecEnabled = true;

  const modalLogic = getRoleChangedLogic({
    t,
    closeModal,
    role,
    orgName,
    ownerName,
    isIRecEnabled,
  });

  return { open, ...modalLogic };
};
