import { GenericFormProps } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export type TUpdateUserDataFormValues = {
  firstName: UserDTO['firstName'];
  lastName: UserDTO['lastName'];
  telephone: UserDTO['telephone'];
  status: UserDTO['status'];
  kycStatus: UserDTO['kycStatus'];
};

export const useUpdateUserAccountDataFormConfig = (
  user: UserDTO
): Omit<GenericFormProps<TUpdateUserDataFormValues>, 'submitHandler'> => {
  const { t } = useTranslation();
  const { firstName, lastName, telephone, status, kycStatus } = user;
  const initialFormData: TUpdateUserDataFormValues = {
    firstName,
    lastName,
    telephone,
    status,
    kycStatus,
  };
  return {
    buttonText: t('general.buttons.edit'),
    fields: [
      {
        label: t('user.profile.firstName'),
        name: 'firstName',
        required: true,
      },
      {
        label: t('user.profile.lastName'),
        name: 'lastName',
        required: true,
      },
      {
        label: t('user.profile.telephone'),
        name: 'telephone',
        required: true,
      },
      {
        label: t('user.profile.status'),
        name: 'status',
        textFieldProps: { disabled: true },
      },
      {
        label: t('user.profile.kycStatus'),
        name: 'kycStatus',
        textFieldProps: { disabled: true },
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: initialFormData,
    twoColumns: true,
    inputsVariant: 'filled' as any,
    validationSchema: Yup.object().shape({
      firstName: Yup.string().label(t('user.profile.firstName')).required(),
      lastName: Yup.string().label(t('user.profile.lastName')).required(),
      telephone: Yup.string()
        .min(10)
        .label(t('user.profile.telephone'))
        .required(),
    }),
  };
};
