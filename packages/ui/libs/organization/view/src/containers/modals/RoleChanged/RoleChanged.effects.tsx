import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { getRoleChangedLogic } from '@energyweb/origin-ui-organization-logic';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../../context';

export const useRoleChangedEffects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { roleChanged: open } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();

  const isIRecEnabled = true;

  const { data: user } = useUserControllerMe();
  const orgName = user?.organization?.name;
  const role = user?.rights;

  const closeModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_ROLE_CHANGED,
      payload: false,
    });

    if (isIRecEnabled) {
      dispatchModals({
        type: OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER,
        payload: true,
      });
    } else if (!user?.organization?.blockchainAccountAddress) {
      dispatchModals({
        type: OrganizationModalsActionsEnum.SHOW_REGISTER_THANK_YOU,
        payload: true,
      });
    } else {
      navigate('/organization/my');
    }
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
