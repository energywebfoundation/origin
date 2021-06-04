import { GenericFormProps } from '@energyweb/origin-ui-core';
import { UnpackNestedValue } from 'react-hook-form';
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
  initialFormData: TUpdateUserDataFormValues
): Omit<GenericFormProps<TUpdateUserDataFormValues>, 'submitHandler'> => {
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
    inputsVariant: 'filled',
    validationSchema: Yup.object().shape({
      firstName: Yup.string().label(t('user.profile.firstName')).required(),
      lastName: Yup.string().label(t('user.profile.lastName')).required(),
      telephone: Yup.string().label(t('user.profile.telephone')).required(),
    }),
  };
};
