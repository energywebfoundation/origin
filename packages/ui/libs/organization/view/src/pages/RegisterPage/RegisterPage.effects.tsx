import { useOrganizationRegisterHandler } from '@energyweb/origin-ui-organization-data';
import { useRegisterOrganizationFormLogic } from '@energyweb/origin-ui-organization-logic';
import { RegisterOrgDocs } from '../../containers/file';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
} from '../../context';

export const useRegisterPageEffects = () => {
  const dispatchModals = useOrgModalsDispatch();

  const openRoleChangedModal = () =>
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_ROLE_CHANGED,
      payload: true,
    });

  const openAlreadyExistsModal = () =>
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_ORGANIZATION_ALREADY_EXISTS,
      payload: true,
    });

  const submitHandler = useOrganizationRegisterHandler({
    openRoleChangedModal,
    openAlreadyExistsModal,
  });
  const formsLogic = useRegisterOrganizationFormLogic();

  const formsWithDocsUpload = formsLogic.forms.map((form) =>
    form.customStep
      ? {
          ...form,
          component: RegisterOrgDocs,
        }
      : form
  );

  const formData = {
    ...formsLogic,
    forms: formsWithDocsUpload,
    submitHandler,
  };

  return { formData };
};
