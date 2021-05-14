import { Role } from '@energyweb/origin-backend-core';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export type InviteFormValues = {
  email: string;
  role: Role;
};

type TUseInviteFormLogic = (
  t: TFunction
) => Omit<GenericFormProps<InviteFormValues>, 'submitHandler'>;

export const getInviteFormLogic: TUseInviteFormLogic = (t) => {
  return {
    initialValues: {
      email: '',
      role: Role.OrganizationUser,
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .email()
        .required()
        .label(t('organization.invite.email')),
    }),
    fields: [
      {
        name: 'email',
        label: t('organization.invite.email'),
      },
      {
        name: 'role',
        label: t('organization.invite.role'),
        select: true,
        options: [
          {
            value: Role.OrganizationUser,
            label: t('organization.invite.member'),
          },
          {
            value: Role.OrganizationDeviceManager,
            label: t('organization.invite.deviceManager'),
          },
          {
            value: Role.OrganizationAdmin,
            label: t('organization.invite.organizationAdmin'),
          },
        ],
      },
    ],
    submitHandler: (values) => console.log(values),
    buttonText: t('organization.invite.inviteButton'),
  };
};
