// @should localize
import { Role } from '@energyweb/origin-backend-core';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import * as yup from 'yup';

type InviteFormValues = {
  email: string;
  role: Role;
};

export const inviteForm: GenericFormProps<InviteFormValues> = {
  initialValues: {
    email: '',
    role: Role.OrganizationUser,
  },
  validationSchema: yup.object({
    email: yup.string().email().required().label('Email'),
  }),
  fields: [
    {
      name: 'email',
      label: 'Email',
    },
    {
      name: 'role',
      label: 'Role',
      select: true,
      options: [
        { value: Role.OrganizationUser, label: 'Member' },
        { value: Role.OrganizationDeviceManager, label: 'Device Manager' },
        { value: Role.OrganizationAdmin, label: 'Admin' },
      ],
    },
  ],
  submitHandler: (values) => console.log(values),
  buttonText: 'Invite',
};
