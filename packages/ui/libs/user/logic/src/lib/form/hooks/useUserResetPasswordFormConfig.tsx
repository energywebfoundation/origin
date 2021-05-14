import { GenericFormProps } from '@energyweb/origin-ui-core';
import { UnpackNestedValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export type TUserResetPasswordFormValues = {
  email: string;
};

const INITIAL_FORM_VALUES: TUserResetPasswordFormValues = {
  email: '',
};

export const useUserResetPasswordFormConfig = (
  formSubmitHandler: (
    values: UnpackNestedValue<TUserResetPasswordFormValues>
  ) => void
): GenericFormProps<TUserResetPasswordFormValues> => {
  const { t } = useTranslation();
  return {
    buttonFullWidth: true,
    buttonText: t('Reset password'),
    fields: [
      {
        label: t('user.properties.email'),
        name: 'email',
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: INITIAL_FORM_VALUES,
    submitHandler: formSubmitHandler,
    validationSchema: Yup.object().shape({
      username: Yup.string()
        .email()
        .label(t('user.properties.email'))
        .required(),
    }),
  };
};
