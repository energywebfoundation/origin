import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { getRoleChangedLogic } from '@energyweb/origin-ui-user-logic';
import { getAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
  useUserModalsStore,
  useUserModalsDispatch,
  UserModalsActionsEnum,
} from '../../../context';
import { useQueryClient } from 'react-query';

export const useRoleChangedEffects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = getAuthenticationToken();
  const queryClient = useQueryClient();

  const { roleChanged: open } = useUserModalsStore();
  const dispatchModals = useUserModalsDispatch();

  const isIRecEnabled = true;

  const { data: user } = useUserControllerMe({ query: { enabled: !!token } });
  const orgName = user?.organization?.name;
  const role = user?.rights;

  const closeModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_ROLE_CHANGED,
      payload: false,
    });
    queryClient.resetQueries();
    navigate('/');
  };

  const modalLogic = getRoleChangedLogic({
    t,
    closeModal,
    role,
    orgName,
    isIRecEnabled,
  });

  return { open, ...modalLogic };
};
