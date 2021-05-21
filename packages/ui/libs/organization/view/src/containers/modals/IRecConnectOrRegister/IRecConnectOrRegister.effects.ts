import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { useIRecConnectOrRegisterLogic } from '@energyweb/origin-ui-organization-logic';
import { useNavigate } from 'react-router';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../../context';

export const useIRecConnectOrRegisterEffects = () => {
  const { iRecConnectOrRegister: open } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();
  const navigate = useNavigate();
  const { data: user } = useUserControllerMe();

  const notNow = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER,
      payload: false,
    });

    if (!user?.blockchainAccountAddress) {
      dispatchModals({
        type: OrganizationModalsActionsEnum.SHOW_REGISTER_THANK_YOU,
        payload: true,
      });
    } else {
      navigate('/organization/my');
    }
  };

  const registerIRec = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER,
      payload: false,
    });
    navigate('/organization/register-irec');
  };

  const { title, text, buttons } = useIRecConnectOrRegisterLogic(
    notNow,
    registerIRec
  );

  return { open, title, text, buttons };
};
