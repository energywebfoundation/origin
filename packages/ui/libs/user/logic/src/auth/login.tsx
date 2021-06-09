import { GenericFormProps } from '@energyweb/origin-ui-core';
import { UnpackNestedValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export type TUserLoginFormValues = {
  username: string;
  password: string;
};

const INITIAL_FORM_VALUES: TUserLoginFormValues = {
  username: '',
  password: '',
};

export const useUserLogInFormConfig = (
  formSubmitHandler: (values: UnpackNestedValue<TUserLoginFormValues>) => void
): GenericFormProps<TUserLoginFormValues> => {
  const { t } = useTranslation();

  return {
    buttonFullWidth: true,
    buttonText: t('user.login.loginButton'),
    fields: [
      {
        label: t('user.login.email'),
        name: 'username',
      },
      {
        label: t('user.login.password'),
        type: 'password',
        name: 'password',
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: INITIAL_FORM_VALUES,
    submitHandler: formSubmitHandler,
    inputsVariant: 'filled',
    validationSchema: Yup.object().shape({
      username: Yup.string().email().label(t('user.login.email')).required(),
      password: Yup.string().label(t('user.login.password')).required(),
    }),
  };
};
