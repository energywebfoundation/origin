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
    validationMode: 'onSubmit',
    fields: [
      {
        label: t('user.register.title'),
        name: 'title',
        select: true,
        options: TITLE_OPTIONS,
        required: true,
        inputProps: {
          ['data-cy']: 'register-title-select',
        },
        additionalInputProps: {
          valueToOpen: 'Other',
          name: 'titleInput',
          label: t('user.register.title'),
          required: true,
          inputProps: {
            ['data-cy']: 'register-other-title-input',
          },
        },
      },
      {
        label: t('user.register.firstName'),
        name: 'firstName',
        required: true,
        inputProps: {
          ['data-cy']: 'firstName',
        },
      },
      {
        label: t('user.register.lastName'),
        name: 'lastName',
        required: true,
        inputProps: {
          ['data-cy']: 'lastName',
        },
      },
      {
        label: t('user.register.email'),
        name: 'email',
        required: true,
        inputProps: {
          ['data-cy']: 'email',
        },
      },
      {
        label: t('user.register.telephone'),
        name: 'telephone',
        required: true,
        inputProps: {
          ['data-cy']: 'telephone',
        },
      },
      {
        type: 'password',
        label: t('user.register.password'),
        name: 'password',
        required: true,
        inputProps: {
          ['data-cy']: 'password',
        },
      },
    ],
    twoColumns: true,
    buttonWrapperProps: { justifyContent: 'flex-start' },
    buttonProps: { ['data-cy']: 'register-button' },
    initialValues: INITIAL_FORM_VALUES,
    submitHandler: formSubmitHandler,
    inputsVariant: 'filled',
    validationSchema: Yup.object().shape({
      title: Yup.string().label(t('user.register.title')).required(),
      firstName: Yup.string().label(t('user.register.firstName')).required(),
      lastName: Yup.string().label(t('user.register.lastName')).required(),
      email: Yup.string().email().label(t('user.register.email')).required(),
      telephone: Yup.string()
        .required()
        .min(10)
        .label(t('user.register.telephone')),
      password: Yup.string()
        .required()
        .matches(
          /((?=.*[0-9])(?=.*[a-z]).{6,})/,
          t('user.register.passwordValidation')
        )
        .label(t('user.register.password')),
    }),
  };
};
