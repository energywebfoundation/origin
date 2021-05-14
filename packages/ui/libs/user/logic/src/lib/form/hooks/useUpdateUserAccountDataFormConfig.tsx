import { GenericFormProps } from '@energyweb/origin-ui-core';
import { UnpackNestedValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { IUser, KYCStatus, UserStatus } from '@energyweb/origin-backend-core';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export type TUpdateUserDataFormValues = Omit<IUser, 'id'>;

const INITIAL_FORM_VALUES: IUser = {
  id: null,
  title: '',
  firstName: '',
  lastName: '',
  email: '',
  telephone: '',
  blockchainAccountAddress: '',
  blockchainAccountSignedMessage: '',
  notifications: null,
  organization: null,
  rights: null,
  status: UserStatus.Pending,
  kycStatus: KYCStatus.Pending,
  emailConfirmed: false,
};

export const useUpdateUserAccountDataFormConfig = (
  initialData: UserDTO,
  formSubmitHandler: (
    values: UnpackNestedValue<TUpdateUserDataFormValues>
  ) => void
): GenericFormProps<TUpdateUserDataFormValues> => {
  const { t } = useTranslation();

  return {
    buttonFullWidth: true,
    buttonText: t('Save'),
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
    initialValues: INITIAL_FORM_VALUES,
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
