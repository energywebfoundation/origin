import { useOrganizationRegisterHandler } from '@energyweb/origin-ui-organization-data';
import { createRegisterOrganizationFormLogic } from '@energyweb/origin-ui-organization-logic';
import { RegisterOrgDocs } from '../../containers/file';
import { useTranslation } from 'react-i18next';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
} from '../../context';

export const useRegisterPageEffects = () => {
  const { t } = useTranslation();
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
  const formsLogic = createRegisterOrganizationFormLogic(t);

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
