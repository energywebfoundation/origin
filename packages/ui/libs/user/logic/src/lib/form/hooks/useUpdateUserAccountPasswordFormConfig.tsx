import { GenericFormProps } from '@energyweb/origin-ui-core';
import { UnpackNestedValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export type TUpdateUserPasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

const INITIAL_FORM_VALUES = {
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
};
export const useUpdateUserAccountPasswordFormConfig = (
  formSubmitHandler: (
    values: UnpackNestedValue<TUpdateUserPasswordFormValues>
  ) => void
): GenericFormProps<TUpdateUserPasswordFormValues> => {
  const { t } = useTranslation();

  return {
    buttonFullWidth: true,
    buttonText: t('user.profile.actions.changePassword'),
    fields: [
      {
        type: 'password',
        label: t('user.properties.currentPassword'),
        name: 'currentPassword',
      },
      {
        type: 'password',
        label: t('user.properties.newPassword'),
        name: 'newPassword',
      },
      {
        type: 'password',
        label: t('user.properties.newPasswordConfirm'),
        name: 'newPasswordConfirm',
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: INITIAL_FORM_VALUES,
    submitHandler: formSubmitHandler,
    validationSchema: Yup.object().shape({
      currentPassword: Yup.string()
        .label(t('user.properties.currentPassword'))
        .required(),
      newPassword: Yup.string()
        .label(t('user.properties.newPassword'))
        .required(),
      newPasswordConfirm: Yup.string()
        .oneOf(
          [Yup.ref('newPassword'), null],
          t('user.properties.confirmDoesntMatch')
        )
        .label(t('user.properties.confirmPassword'))
        .required(),
    }),
  };
};
