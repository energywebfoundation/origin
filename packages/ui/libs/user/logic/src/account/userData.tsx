import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export type TUpdateUserDataFormValues = {
  firstName: UserDTO['firstName'];
  lastName: UserDTO['lastName'];
  telephone: UserDTO['telephone'];
  status: UserDTO['status'];
  kycStatus: UserDTO['kycStatus'];
  emailConfirmed: string;
};

export const useUpdateUserAccountDataFormConfig = (
  user: UserDTO
): Omit<GenericFormProps<TUpdateUserDataFormValues>, 'submitHandler'> => {
  const { t } = useTranslation();
  const { firstName, lastName, telephone, status, kycStatus, emailConfirmed } =
    user;
  const initialFormData: TUpdateUserDataFormValues = {
    firstName,
    lastName,
    telephone,
    status,
    kycStatus,
    emailConfirmed: emailConfirmed
      ? t('user.profile.yes')
      : t('user.profile.no'),
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
      {
        label: t('user.profile.emailConfirmed'),
        name: 'emailConfirmed',
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
