import { GenericFormProps } from '@energyweb/origin-ui-core';
import { useOrganizationInviteHandler } from '@energyweb/origin-ui-organization-data';
import {
  getInviteFormLogic,
  InviteFormValues,
} from '@energyweb/origin-ui-organization-logic';
import { useTranslation } from 'react-i18next';

export const useInvitePageEffects = () => {
  const { t } = useTranslation();

  const {
    fields,
    initialValues,
    validationSchema,
    buttonText,
  } = getInviteFormLogic(t);

  const submitHandler = useOrganizationInviteHandler();

  const formData: GenericFormProps<InviteFormValues> = {
    fields,
    initialValues,
    validationSchema,
    buttonText,
    submitHandler,
  };

  return { formData };
};
