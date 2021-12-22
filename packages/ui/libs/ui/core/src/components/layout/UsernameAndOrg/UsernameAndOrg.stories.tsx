/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { UsernameAndOrg, UsernameAndOrgProps } from './UsernameAndOrg';

const description =
  'Component rendering supplied username and his organisation name ' +
  'with optional Dot icon sigmalizing that either user or organisation status is pending. ' +
  'Also a tooltip with explanation text can be displayed on Dot hover.';

export default {
  title: 'Layout / UsernameAndOrg',
  component: UsernameAndOrg,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Description>{description}</Description>
          <Primary />
          <ArgsTable story={PRIMARY_STORY} />
          <Stories />
        </>
      ),
    },
  },
  argTypes: {
    userPending: {
      table: { defaultValue: { summary: false } },
    },
    userTooltip: {
      description: 'Should be supplied alongside `userPending={true}`',
      table: { defaultValue: { summary: '' } },
    },
    orgName: {
      table: { defaultValue: { summary: '' } },
    },
    orgPending: {
      table: { defaultValue: { summary: false } },
    },
    orgTooltip: {
      description: 'Should be supplied alongside `orgPending={true}`',
      table: { defaultValue: { summary: '' } },
    },
    wrapperProps: {
      description: 'Props supplied to root `Box` component',
      table: { type: { summary: 'BoxProps' } },
      control: false,
    },
  },
} as Meta;

const Template: Story<UsernameAndOrgProps> = (args) => (
  <UsernameAndOrg {...args} />
);

export const Default = Template.bind({});
Default.args = {
  username: 'John Doe',
};

export const WithOrganisationName = Template.bind({});
WithOrganisationName.args = {
  username: 'John Doe',
  orgName: 'Lorem ipsum organization',
};

export const WithPendingDot = Template.bind({});
WithPendingDot.args = {
  username: 'John Doe',
  orgName: 'Lorem ipsum organization',
  orgPending: true,
};

export const WithPendingTooltips = Template.bind({});
WithPendingTooltips.args = {
  username: 'John Doe',
  userPending: true,
  userTooltip: 'Pending user status message',
  orgName: 'Lorem ipsum organization',
  orgPending: true,
  orgTooltip: 'Pending organization status message',
};
