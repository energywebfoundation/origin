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
import {
  TextWithPendingDot,
  TextWithPendingDotProps,
} from './TextWithPendingDot';

const description =
  'Component used for displaying text and optional status indicator (dot) with a tooltip functionality.';

export default {
  title: 'Text / TextWithPendingDot',
  component: TextWithPendingDot,
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
    tooltipText: {
      description:
        'Should be supplied alongside `pending={true}` or `showSuccessDot={true}`',
    },
    typographyProps: {
      description: 'Props supplied to `Typography` component of `textContent`',
      table: {
        type: { summary: "TypographyProps & { component?: 'span' | 'p' }" },
      },
      control: false,
    },
  },
} as Meta;

const Template: Story<TextWithPendingDotProps> = (args) => (
  <TextWithPendingDot {...args} />
);

export const Default = Template.bind({});
Default.args = {
  textContent: 'John Doe',
};

export const Pending = Template.bind({});
Pending.args = {
  textContent: 'John Doe',
  pending: true,
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  textContent: 'John Doe',
  pending: true,
  tooltipText: 'User status - Pending',
};

export const WithSuccessDot = Template.bind({});
WithSuccessDot.args = {
  textContent: 'John Doe',
  showSuccessDot: true,
  tooltipText: 'User status - Active',
};
