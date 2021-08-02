import { GenericFormProps } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export type TUpdateUserPasswordFormValues = {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

type TUseUpdateUserAccountPasswordFormConfig = () => Omit<
  GenericFormProps<TUpdateUserPasswordFormValues>,
  'submitHandler'
>;

const INITIAL_FORM_VALUES = {
  oldPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
};

export const useUpdateUserAccountPasswordFormConfig: TUseUpdateUserAccountPasswordFormConfig =
  () => {
    const { t } = useTranslation();

    return {
      buttonText: t('general.buttons.change'),
      fields: [
        {
          type: 'password',
          label: t('user.profile.currentPassword'),
          name: 'oldPassword',
        },
        {
          type: 'password',
          label: t('user.profile.newPassword'),
          name: 'newPassword',
        },
        {
          type: 'password',
          label: t('user.profile.newPasswordConfirm'),
          name: 'newPasswordConfirm',
        },
      ],
      buttonWrapperProps: { justifyContent: 'flex-start' },
      initialValues: INITIAL_FORM_VALUES,
      inputsVariant: 'filled' as any,
      validationSchema: Yup.object().shape({
        oldPassword: Yup.string()
          .label(t('user.profile.currentPassword'))
          .required(),
        newPassword: Yup.string()
          .label(t('user.profile.newPassword'))
          .required(),
        newPasswordConfirm: Yup.string()
          .oneOf(
            [Yup.ref('newPassword'), null],
            t('user.profile.confirmDoesntMatch')
          )
          .label(t('user.profile.confirmPassword'))
          .required(),
      }),
    };
  };
