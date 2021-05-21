import { useIRecRegisterHandler } from '@energyweb/origin-ui-organization-data';
import { createRegisterIRecFormLogic } from '@energyweb/origin-ui-organization-logic';
import { useTranslation } from 'react-i18next';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
} from '../../context';

export const useRegisterIRecPageEffects = () => {
  const { t } = useTranslation();
  const dispatchModals = useOrgModalsDispatch();
  const openIRecRegisteredModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_ACCOUNT_REGISTERED,
      payload: true,
    });
  };

  const multiStepFormLogic = createRegisterIRecFormLogic(t);
  const submitHandler = useIRecRegisterHandler(openIRecRegisteredModal);

  const formData = {
    ...multiStepFormLogic,
    submitHandler,
  };

  return { formData };
};
