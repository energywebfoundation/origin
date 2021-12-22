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
  ConditionalWrapper,
  ConditionalWrapperProps,
} from './ConditionalWrapper';

const description =
  'Utility component used for conditional wrapping of the supplied `children` with `wrapper`';

export default {
  title: 'Utils / ConditionalWrapper',
  component: ConditionalWrapper,
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
    condition: {
      description: 'If `true` - will be wrapped into a `Wrapper`',
    },
    wrapper: {
      control: false,
    },
    children: {
      table: { type: { summary: 'ReactNode' } },
      type: { name: 'other', value: 'ReactNode', required: true },
      control: false,
    },
  },
} as Meta;

const Template: Story<ConditionalWrapperProps> = (args) => (
  <ConditionalWrapper {...args} />
);

export const FalsyCondition = Template.bind({});
FalsyCondition.args = {
  condition: false,
  wrapper: ({ children }) => (
    <div
      style={{
        border: '1px solid red',
        width: '100%',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  ),
  children: (
    <span style={{ color: 'white' }}>Some text content as children</span>
  ),
};

export const TruthyCondition = Template.bind({});
TruthyCondition.args = {
  condition: true,
  wrapper: ({ children }) => (
    <div
      style={{
        border: '1px solid red',
        width: '100%',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  ),
  children: (
    <span style={{ color: 'white' }}>Some text content as children</span>
  ),
};
