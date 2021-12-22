import { GenericFormProps } from '@energyweb/origin-ui-core';
import { RequestResetPasswordFormValues } from '@energyweb/origin-ui-user-data';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import * as yup from 'yup';

export const useRequestResetPasswordFormLogic = (
  isMutating: boolean
): Omit<GenericFormProps<RequestResetPasswordFormValues>, 'submitHandler'> => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return {
    formTitle: t('user.requestResetPassword.formTitle'),
    formTitleVariant: 'h6',
    loading: isMutating,
    initialValues: { email: '' },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .email()
        .label(t('user.requestResetPassword.email'))
        .required(),
    }),
    fields: [
      {
        name: 'email',
        label: t('user.requestResetPassword.email'),
        required: true,
      },
    ],
    secondaryButtons: [
      {
        label: t('general.buttons.back'),
        onClick: () => navigate('/login'),
        variant: 'outlined',
      },
    ],
    inputsVariant: 'filled',
    validationMode: 'onSubmit',
    buttonWrapperProps: { display: 'flex', justifyContent: 'space-between' },
    buttonText: t('general.buttons.submit'),
  };
};
