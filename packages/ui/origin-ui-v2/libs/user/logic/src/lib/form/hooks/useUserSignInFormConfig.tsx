import { GenericFormProps } from '@energyweb/origin-ui-core';
import { SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export type TUserSignInFormValues = {
  title: string;
  firstName: string;
  lastName: string;
  telephone: string;
  email: string;
  password: string;
};

const INITIAL_FORM_VALUES: TUserSignInFormValues = {
  title: '',
  firstName: '',
  lastName: '',
  telephone: '',
  email: '',
  password: '',
};

const TITLE_OPTIONS = ['Dr', 'Mr', 'Mrs', 'Ms', 'Other'];

export const useUserSignInFormConfig = (
  formSubmitHandler: SubmitHandler<TUserSignInFormValues>
): GenericFormProps<TUserSignInFormValues> => {
  const { t } = useTranslation();
  return {
    buttonText: t('user.actions.register'),
    fields: [
      {
        label: t('user.properties.title'),
        name: 'title',
        select: true,
        options: TITLE_OPTIONS.map((opt) => ({ label: opt, value: opt })),
      },
      {
        label: t('user.properties.firstName'),
        name: 'firstName',
      },
      {
        label: t('user.properties.lastName'),
        name: 'lastName',
      },
      {
        label: t('user.properties.email'),
        name: 'username',
      },
      {
        label: t('user.properties.telephone'),
        name: 'telephone',
      },
      {
        type: 'password',
        label: t('user.properties.password'),
        name: 'password',
      },
    ],
    twoColumns: true,
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: INITIAL_FORM_VALUES,
    submitHandler: formSubmitHandler,
    validationSchema: Yup.object().shape({
      title: Yup.string().label(t('user.properties.title')).required(),
      firstName: Yup.string().label(t('user.properties.firstName')).required(),
      lastName: Yup.string().label(t('user.properties.lastName')).required(),
      telephone: Yup.string().label(t('user.properties.telephone')).required(),
      username: Yup.string()
        .email()
        .label(t('user.properties.email'))
        .required(),
      password: Yup.string().label(t('user.properties.password')).required(),
    }),
  };
};
