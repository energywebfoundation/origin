import { Role } from '@energyweb/origin-backend-core';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { roleNamesInvitePage } from '../utils';

export type InviteFormValues = {
  email: string;
  role: Role;
};

type TUseInviteFormLogic = () => Omit<
  GenericFormProps<InviteFormValues>,
  'submitHandler'
>;

export const useInviteFormLogic: TUseInviteFormLogic = () => {
  const { t } = useTranslation();

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
        options: roleNamesInvitePage(t),
      },
    ],
    buttonText: t('organization.invite.inviteButton'),
  };
};
