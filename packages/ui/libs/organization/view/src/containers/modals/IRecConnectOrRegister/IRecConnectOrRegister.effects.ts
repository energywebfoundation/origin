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

  const notNow = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER,
      payload: false,
    });
  };

  const registerIRec = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER,
      payload: false,
    });
    navigate('/register-irec');
  };

  const { title, text, buttons } = useIRecConnectOrRegisterLogic(
    notNow,
    registerIRec
  );

  return { open, title, text, buttons };
};
