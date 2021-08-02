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

const TITLES = ['Dr', 'Mr', 'Mrs', 'Ms', 'Other'];

export const useUserSignInFormConfig = (
  formSubmitHandler: GenericFormProps<TUserSignInFormValues>['submitHandler']
): GenericFormProps<TUserSignInFormValues> => {
  const { t } = useTranslation();
  const TITLE_OPTIONS = TITLES.map((title) => ({
    label: t(`general.titles.${title.toLowerCase()}`),
    value: title,
  }));
  return {
    buttonText: t('general.buttons.register'),
    fields: [
      {
        label: t('user.register.title'),
        name: 'title',
        select: true,
        options: TITLE_OPTIONS,
        required: true,
        additionalInputProps: {
          valueToOpen: 'Other',
          name: 'titleInput',
          label: t('user.register.title'),
          required: true,
        },
      },
      {
        label: t('user.register.firstName'),
        name: 'firstName',
        required: true,
      },
      {
        label: t('user.register.lastName'),
        name: 'lastName',
        required: true,
      },
      {
        label: t('user.register.email'),
        name: 'email',
        required: true,
      },
      {
        label: t('user.register.telephone'),
        name: 'telephone',
        required: true,
      },
      {
        type: 'password',
        label: t('user.register.password'),
        name: 'password',
        required: true,
      },
    ],
    twoColumns: true,
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: INITIAL_FORM_VALUES,
    submitHandler: formSubmitHandler,
    inputsVariant: 'filled',
    validationSchema: Yup.object().shape({
      title: Yup.string().label(t('user.register.title')).required(),
      firstName: Yup.string().label(t('user.register.firstName')).required(),
      lastName: Yup.string().label(t('user.register.lastName')).required(),
      email: Yup.string().email().label(t('user.register.email')).required(),
      telephone: Yup.string().label(t('user.register.telephone')).required(),
      password: Yup.string().label(t('user.register.password')).required(),
    }),
  };
};
