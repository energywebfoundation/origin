import { GenericFormProps } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { KYC_STATUS_OPTIONS, STATUS_OPTIONS } from './statusOptions';

export type TAdminUpdateUserFormValues = {
  title: UserDTO['title'];
  firstName: UserDTO['firstName'];
  lastName: UserDTO['lastName'];
  email: UserDTO['email'];
  telephone: UserDTO['telephone'];
  status: UserDTO['status'];
  kycStatus: UserDTO['kycStatus'];
};

export const useAdminUpdateUserFormLogic = (
  user: UserDTO
): Omit<GenericFormProps<TAdminUpdateUserFormValues>, 'submitHandler'> => {
  const { t } = useTranslation();

  const initialFormData = {
    title: user?.title,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    telephone: user?.telephone,
    status: user?.status,
    kycStatus: user?.kycStatus,
  };

  return {
    buttonText: t('general.buttons.update'),
    fields: [
      {
        label: t('admin.updateUser.title'),
        name: 'title',
      },
      {
        label: t('admin.updateUser.firstName'),
        name: 'firstName',
      },
      {
        label: t('admin.updateUser.lastName'),
        name: 'lastName',
      },
      {
        label: t('admin.updateUser.email'),
        name: 'email',
      },
      {
        label: t('admin.updateUser.telephone'),
        name: 'telephone',
      },
      {
        label: t('admin.updateUser.status'),
        name: 'status',
        select: true,
        options: STATUS_OPTIONS,
      },
      {
        label: t('admin.updateUser.kycStatus'),
        name: 'kycStatus',
        select: true,
        options: KYC_STATUS_OPTIONS,
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: initialFormData,
    twoColumns: true,
    inputsVariant: 'filled',
    validationSchema: Yup.object().shape({
      firstName: Yup.string().label(t('admin.updateUser.firstName')).required(),
      lastName: Yup.string().label(t('admin.updateUser.lastName')).required(),
      email: Yup.string().email().label(t('admin.updateUser.email')).required(),
      telephone: Yup.string().label(t('admin.updateUser.telephone')).required(),
    }),
  };
};
