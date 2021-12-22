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
import { InfoRounded } from '@mui/icons-material';
import { IconPopover, IconPopoverProps, IconSize } from './IconPopover';

const description =
  'Icon which displays text in popover. By default has `onHover` behaviour, but can be changed to display the popover on click.';

export default {
  title: 'Icons / IconPopover',
  component: IconPopover,
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
    icon: {
      control: false,
    },
    popoverText: {
      description:
        'Array of strings to be displayed as text in popover. Each item of array has a line break after it.',
    },
    iconSize: {
      table: {
        defaultValue: { summary: IconSize.Medium },
      },
    },
    clickable: {
      description:
        'If `true` - popover will open on icon click instead of hover',
    },
    iconProps: {
      control: false,
    },
    className: {
      description: 'Class for wrapper `div` component',
      control: false,
    },
  },
} as Meta;

const Template: Story<IconPopoverProps> = (args) => <IconPopover {...args} />;

export const Default = Template.bind({});
Default.args = {
  icon: InfoRounded,
  popoverText: ['Popover info text to explain some concepts to user'],
};
