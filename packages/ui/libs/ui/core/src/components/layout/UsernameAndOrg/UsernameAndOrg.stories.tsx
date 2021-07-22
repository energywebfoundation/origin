import React from 'react';
import { Meta } from '@storybook/react';
import { UsernameAndOrg, UsernameAndOrgProps } from './UsernameAndOrg';

export default {
  title: 'Layout / UsernameAndOrg',
  component: UsernameAndOrg,
} as Meta;

export const Default = (args: UsernameAndOrgProps) => (
  <UsernameAndOrg {...args} />
);

Default.args = {
  username: 'John Doe',
  userPending: true,
  userTooltip: 'Pending user status message',
  orgName: 'Lorem ipsum organization',
  orgPending: true,
  orgTooltip: 'Pending organization status message',
};
