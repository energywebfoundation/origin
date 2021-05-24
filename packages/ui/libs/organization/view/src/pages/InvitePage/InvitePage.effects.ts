import { GenericFormProps } from '@energyweb/origin-ui-core';
import { useOrganizationInviteHandler } from '@energyweb/origin-ui-organization-data';
import {
  useInviteFormLogic,
  InviteFormValues,
} from '@energyweb/origin-ui-organization-logic';

export const useInvitePageEffects = () => {
  const {
    fields,
    initialValues,
    validationSchema,
    buttonText,
  } = useInviteFormLogic();

  const { submitHandler, apiLoading } = useOrganizationInviteHandler();

  const pageLoading = apiLoading;

  const formData: GenericFormProps<InviteFormValues> = {
    fields,
    initialValues,
    validationSchema,
    buttonText,
    submitHandler,
  };

  return { formData, pageLoading };
};
