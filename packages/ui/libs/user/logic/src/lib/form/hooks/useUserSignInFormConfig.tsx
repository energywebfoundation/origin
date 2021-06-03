import { GenericFormProps } from '@energyweb/origin-ui-core';
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
  formSubmitHandler: GenericFormProps<TUserSignInFormValues>['submitHandler']
): GenericFormProps<TUserSignInFormValues> => {
  const { t } = useTranslation();
  return {
    buttonText: t('general.buttons.register'),
    fields: [
      {
        label: t('account.register.title'),
        name: 'title',
        select: true,
        options: TITLE_OPTIONS.map((opt) => ({ label: opt, value: opt })),
      },
      {
        label: t('account.register.firstName'),
        name: 'firstName',
      },
      {
        label: t('account.register.lastName'),
        name: 'lastName',
      },
      {
        label: t('account.register.email'),
        name: 'email',
      },
      {
        label: t('account.register.telephone'),
        name: 'telephone',
      },
      {
        type: 'password',
        label: t('account.register.password'),
        name: 'password',
      },
    ],
    twoColumns: true,
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: INITIAL_FORM_VALUES,
    submitHandler: formSubmitHandler,
    inputsVariant: 'filled',
    validationSchema: Yup.object().shape({
      title: Yup.string().label(t('account.register.title')).required(),
      firstName: Yup.string().label(t('account.register.firstName')).required(),
      lastName: Yup.string().label(t('account.register.lastName')).required(),
      telephone: Yup.string().label(t('account.register.telephone')).required(),
      email: Yup.string().email().label(t('account.register.email')).required(),
      password: Yup.string().label(t('account.register.password')).required(),
    }),
  };
};
