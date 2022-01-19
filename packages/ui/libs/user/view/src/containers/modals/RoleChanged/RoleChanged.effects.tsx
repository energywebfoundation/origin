import { getRoleChangedLogic } from '@energyweb/origin-ui-user-logic';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import {
  useUserModalsStore,
  useUserModalsDispatch,
  UserModalsActionsEnum,
} from '../../../context';

export const useRoleChangedEffects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    roleChanged: { open, user },
  } = useUserModalsStore();
  const dispatchModals = useUserModalsDispatch();

  const isIRecEnabled = true;

  const orgName = user?.organization?.name;
  const role = user?.rights;

  const closeModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_ROLE_CHANGED,
      payload: { open: false, user: null },
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
