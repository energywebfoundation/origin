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
import { VisibilityButton, VisibilityButtonProps } from './VisibilityButton';

const description = `
  Button with Visibility icon used for password inputs to switch between field display type.
  Normally, state supplied here will be used to change the type of the password input.
`;

export default {
  title: 'Buttons / VisibilityButton',
  component: VisibilityButton,
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
} as Meta;

const Template: Story<VisibilityButtonProps> = (args) => (
  <VisibilityButton {...args} />
);

export const Default = Template.bind({});
Default.args = {
  visible: false,
  setVisible: () => {},
};
