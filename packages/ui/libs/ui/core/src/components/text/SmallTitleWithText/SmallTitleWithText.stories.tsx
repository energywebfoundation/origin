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
  SmallTitleWithText,
  SmallTitleWithTextProps,
} from './SmallTitleWithText';

const description = '';

export default {
  title: 'Text / SmallTitleWithText',
  component: SmallTitleWithText,
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
    text: {
      table: { type: { summary: 'string' } },
      type: { name: 'string', required: true },
    },
    title: {
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
      control: { type: 'text' },
    },
    titleProps: {
      description: 'Props supplied to `Typography` component of title',
      table: { type: { summary: 'TypographyProps' } },
    },
    titleElement: {
      description: 'Custom element to be displayed as title',
      table: {
        type: { summary: 'ReactNode' },
        defaultValue: { summary: 'null' },
      },
    },
    textProps: {
      description: 'Props supplied to `Typography` component of text',
      table: { type: { summary: 'TypographyProps' } },
    },
    wrapperProps: {
      description: 'Props supplied to wrapper `div` element',
      table: {
        type: {
          summary:
            'React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>',
        },
      },
    },
  },
} as Meta;

const Template: Story<SmallTitleWithTextProps> = (args) => (
  <SmallTitleWithText {...args} />
);

export const Default = Template.bind({});
Default.args = {
  text: 'Lorem ipsum text',
};

export const WithTitle = Template.bind({});
WithTitle.args = {
  text: 'Lorem ipsum text',
  title: 'Nice title',
};
