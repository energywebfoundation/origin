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
    buttonText: t('Save'),
    fields: [
      {
        label: t('user.properties.currentPassword'),
        name: 'currentPassword',
      },
      {
        label: t('user.properties.newPassword'),
        name: 'newPassword',
      },
      {
        label: t('user.properties.newPassword'),
        name: 'newPasswordConfirm',
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: INITIAL_FORM_VALUES,
    submitHandler: formSubmitHandler,
    validationSchema: Yup.object().shape({
      currentPassword: Yup.string().label('Current Password').required(),
      newPassword: Yup.string().label('New Password').required(),
      newPasswordConfirm: Yup.string()
        .oneOf(
          [Yup.ref('newPassword'), null],
          "Entered value doesn't match new password"
        )
        .label('Confirm Password')
        .required(),
    }),
  };
};
