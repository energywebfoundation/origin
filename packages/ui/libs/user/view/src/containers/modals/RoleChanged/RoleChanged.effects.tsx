import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { getRoleChangedLogic } from '@energyweb/origin-ui-organization-logic';
import { getAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
  useUserModalsStore,
  useUserModalsDispatch,
  UserModalsActionsEnum,
} from '../../../context';

export const useRoleChangedEffects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = getAuthenticationToken();

  const { roleChanged: open } = useUserModalsStore();
  const dispatchModals = useUserModalsDispatch();

  const isIRecEnabled = true;

  const { data: user } = useUserControllerMe({ enabled: !!token });
  const orgName = user?.organization?.name;
  const role = user?.rights;
  // mocks
  const ownerName = 'James Brown';

  const closeModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_ROLE_CHANGED,
      payload: false,
    });
    navigate('/');
  };

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
