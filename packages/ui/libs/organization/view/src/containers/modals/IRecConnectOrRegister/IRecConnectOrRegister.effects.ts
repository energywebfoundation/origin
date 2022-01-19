import { getUserControllerMeQueryKey } from '@energyweb/origin-backend-react-query-client';
import { useUser } from '@energyweb/origin-ui-organization-data';
import { useIRecConnectOrRegisterLogic } from '@energyweb/origin-ui-organization-logic';
import { useQueryClient } from 'react-query';
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
  const { user, userLoading } = useUser();
  const queryClient = useQueryClient();
  const userKey = getUserControllerMeQueryKey();

  const notNow = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER,
      payload: false,
    });

    if (!user?.organization?.blockchainAccountAddress) {
      dispatchModals({
        type: OrganizationModalsActionsEnum.SHOW_REGISTER_THANK_YOU,
        payload: true,
      });
    } else {
      navigate('/organization/my');
      queryClient.invalidateQueries(userKey);
    }
  };

  const registerIRec = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER,
      payload: false,
    });
    queryClient.invalidateQueries(userKey);
    navigate('/organization/register-irec');
  };

  const { title, text, buttons } = useIRecConnectOrRegisterLogic(
    notNow,
    registerIRec
  );

  return { open, title, text, buttons, userLoading };
};
