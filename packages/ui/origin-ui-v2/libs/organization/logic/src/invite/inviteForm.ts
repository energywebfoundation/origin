// @should localize and use import for Role from backend-core
import { GenericFormProps } from '@energyweb/origin-ui-core';
import * as yup from 'yup';

export enum Role {
  OrganizationAdmin = 1,
  OrganizationDeviceManager = 2,
  OrganizationUser = 4,
  Issuer = 8,
  Admin = 16,
  SupportAgent = 32,
}

export const inviteForm: GenericFormProps = {
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
