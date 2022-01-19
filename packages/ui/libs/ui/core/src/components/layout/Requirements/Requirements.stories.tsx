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
import { Requirements, RequirementsProps } from './Requirements';

const description =
  'An informational block normally used to prevent user from seeing some private route until he meets all the necessary requirements.';

const rulesTypeDetail = `{
  label: string;
  passing: boolean;
}`;

export default {
  title: 'Layout / Requirements',
  component: Requirements,
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
    rules: {
      description: 'An array of rules to be displayed as list items',
      table: { type: { detail: rulesTypeDetail } },
    },
    title: {
      description: 'Block heading',
    },
    paperProps: {
      description: 'Props supplied to the root `Paper` component',
      table: { type: { summary: 'PaperProps' } },
      control: false,
    },
    titleProps: {
      description:
        'Props supplied to `Typography` component displaying the title',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
    listItemProps: {
      description: 'Props supplied to each `ListItem` component',
      table: { type: { summary: 'ListItemProps' } },
      control: false,
    },
    listItemIconProps: {
      description:
        'Props supplied to each `ListItemIcon` component holding the `Checkbox`',
      table: { type: { summary: 'ListItemIconProps' } },
      control: false,
    },
    checkboxProps: {
      description: 'Props supplied to each `Checkbox` component',
      table: { type: { summary: 'CheckboxProps' } },
      control: false,
    },
    listItemTextProps: {
      description: 'Props supplied to each `ListItemText` component',
      table: { type: { summary: 'ListItemTextProps' } },
      control: false,
    },
  },
} as Meta;

const Template: Story<RequirementsProps> = (args) => <Requirements {...args} />;

export const Default = Template.bind({});
Default.args = {
  rules: [
    {
      label: 'Has blockchain address',
      passing: true,
    },
    {
      label: 'KYC check passed',
      passing: true,
    },
    {
      label: 'Paid participant fee',
      passing: false,
    },
  ],
  title: 'Checklist to display some private route',
};
