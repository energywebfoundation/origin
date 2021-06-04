import { GenericFormProps } from '@energyweb/origin-ui-core';
import { UnpackNestedValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { IUser } from '@energyweb/origin-backend-core';
import {
  FullOrganizationInfoDTO,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';

export type TUpdateUserDataFormValues = Omit<IUser, 'id'> &
  Pick<
    FullOrganizationInfoDTO,
    'blockchainAccountAddress' | 'blockchainAccountSignedMessage'
  >;

export const useUpdateUserAccountDataFormConfig = (
  initialData: UserDTO,
  formSubmitHandler: (
    values: UnpackNestedValue<TUpdateUserDataFormValues>
  ) => void
): GenericFormProps<TUpdateUserDataFormValues> => {
  const { t } = useTranslation();
  return {
    buttonText: t('general.buttons.edit'),
    fields: [
      {
        label: t('user.profile.firstName'),
        name: 'firstName',
      },
      {
        label: t('user.profile.lastName'),
        name: 'lastName',
      },
      {
        label: t('user.profile.telephone'),
        name: 'telephone',
      },
      {
        label: t('user.profile.kycStatus'),
        name: 'kycStatus',
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: { ...(initialData as IUser) },
    inputsVariant: 'filled',
    submitHandler: formSubmitHandler,
    validationSchema: Yup.object().shape({
      username: Yup.string().email().label(t('user.profile.email')).required(),
      password: Yup.string().label(t('user.profile.password')).required(),
    }),
  };
};
