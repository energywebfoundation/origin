/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
} from '@storybook/addon-docs';
import { useState } from 'react';
import { SignInOptions, SignInOptionsProps } from './SignInOptions';

const description = `Component for using in log in forms with default options.`;

export default {
  title: 'Form / SignInOptions',
  component: SignInOptions,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Description>{description}</Description>
          <Primary />
          <ArgsTable story={PRIMARY_STORY} />
        </>
      ),
    },
  },
  argTypes: {
    remember: { control: false },
    setRemember: {},
    forgotPassUrl: {},
    wrapperProps: {
      table: {
        type: {
          summary: 'GridProps',
        },
      },
    },
  },
} as Meta;

const Template: Story<SignInOptionsProps> = (args) => {
  const [remember, setRemember] = useState(false);
  return (
    <SignInOptions {...args} remember={remember} setRemember={setRemember} />
  );
};

export const Default = Template.bind({});
Default.args = {
  forgotPassUrl: '/forgot-password',
};
