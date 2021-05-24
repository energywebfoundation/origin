import { useIRecRegisterHandler } from '@energyweb/origin-ui-organization-data';
import { useRegisterIRecFormLogic } from '@energyweb/origin-ui-organization-logic';
import { useTranslation } from 'react-i18next';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
} from '../../context';

export const useRegisterIRecPageEffects = () => {
  const dispatchModals = useOrgModalsDispatch();
  const openIRecRegisteredModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_ACCOUNT_REGISTERED,
      payload: true,
    });
  };

  const multiStepFormLogic = useRegisterIRecFormLogic();
  const submitHandler = useIRecRegisterHandler(openIRecRegisteredModal);

  const formData = {
    ...multiStepFormLogic,
    submitHandler,
  };

  return { formData };
};
