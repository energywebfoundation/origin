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
    buttonFullWidth: true,
    buttonText: t('user.actions.edit'),
    fields: [
      {
        label: t('user.properties.firstName'),
        name: 'firstName',
      },
      {
        label: t('user.properties.lastName'),
        name: 'lastName',
      },
      {
        label: t('user.properties.telephone'),
        name: 'telephone',
      },
      {
        label: t('user.properties.kycStatus'),
        name: 'kycStatus',
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: { ...(initialData as IUser) },
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
