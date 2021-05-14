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
    buttonText: 'Login',
    fields: [
      {
        label: t('user.properties.email'),
        name: 'username',
      },
      {
        label: t('user.properties.password'),
        type: 'password',
        name: 'password',
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
      password: Yup.string().label(t('user.properties.password')).required(),
    }),
  };
};
