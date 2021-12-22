import { GenericFormProps, VisibilityButton } from '@energyweb/origin-ui-core';
import { ResetPasswordFormValues } from '@energyweb/origin-ui-user-data';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export type TUserResetPasswordFormLogicArgs = {
  passwordVisible: boolean;
  setPasswordVisible: (value: boolean) => void;
  passwordConfirmVisible: boolean;
  setPasswordConfirmVisible: (value: boolean) => void;
  isMutating: boolean;
};

export const useResetPasswordFormLogic = ({
  passwordVisible,
  setPasswordVisible,
  passwordConfirmVisible,
  setPasswordConfirmVisible,
  isMutating,
}: TUserResetPasswordFormLogicArgs): Omit<
  GenericFormProps<ResetPasswordFormValues>,
  'submitHandler'
> => {
  const { t } = useTranslation();
  return {
    formTitle: t('user.resetPassword.formTitle'),
    formTitleVariant: 'h6',
    initialValues: { password: '', passwordConfirm: '' },
    loading: isMutating,
    validationMode: 'onBlur',
    validationSchema: yup.object().shape({
      password: yup
        .string()
        .matches(
          /((?=.*[0-9])(?=.*[a-z]).{6,})/,
          t('user.register.passwordValidation')
        )
        .label(t('user.resetPassword.newPassword'))
        .required(),
      passwordConfirm: yup
        .string()
        .required()
        .oneOf(
          [yup.ref('password'), null],
          t('general.validations.passwordMatch')
        )
        .label(t('user.resetPassword.passwordConfirm')),
    }),
    fields: [
      {
        label: t('user.resetPassword.newPassword'),
        name: 'password',
        required: true,
        type: passwordVisible ? 'text' : 'password',
        endAdornment: {
          element: (
            <VisibilityButton
              visible={passwordVisible}
              setVisible={setPasswordVisible}
            />
          ),
        },
      },
      {
        label: t('user.resetPassword.passwordConfirm'),
        name: 'passwordConfirm',
        required: true,
        type: passwordConfirmVisible ? 'text' : 'password',
        endAdornment: {
          element: (
            <VisibilityButton
              visible={passwordConfirmVisible}
              setVisible={setPasswordConfirmVisible}
            />
          ),
        },
      },
    ],
    inputsVariant: 'filled',
    buttonText: t('general.buttons.submit'),
  };
};
