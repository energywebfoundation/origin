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
import { SpecField, SpecFieldProps } from './SpecField';

const description =
  'Component used for displaying specification of an item. ' +
  'Normally used in card or other small component. ' +
  'Consists of `label` (smaller fontSize, grey color) and `value` (bigger fontSize and contrasting color) ';

export default {
  title: 'Text / SpecField',
  component: SpecField,
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
    wrapperProps: {
      description: 'Props supplied to wrapper `div` element',
      control: false,
    },
    labelProps: {
      description: 'Props supplied to `Typography` component of `label`',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
    valueProps: {
      description: 'Props supplied to `Typography` component of `value`',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
  },
} as Meta;

const Template: Story<SpecFieldProps> = (args) => (
  <div style={{ width: '200px', marginLeft: '30px' }}>
    <SpecField {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  label: 'Location',
  value: 'London',
};

const TemplateMultiple: Story<SpecFieldProps> = (args) => (
  <div style={{ width: '200px', marginLeft: '30px' }}>
    <SpecField {...args} />
    <SpecField {...args} />
    <SpecField {...args} />
  </div>
);

export const Multiple = TemplateMultiple.bind({});
Multiple.args = {
  label: 'Name',
  value: 'John Doe',
};
