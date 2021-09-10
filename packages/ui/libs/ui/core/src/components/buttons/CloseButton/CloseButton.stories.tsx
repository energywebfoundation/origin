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
import { CloseButton, CloseButtonProps } from './CloseButton';

const description = `
  Component used as default close button for modals, sidebars or mobile menus.
`;

export default {
  title: 'Buttons / CloseButton',
  component: CloseButton,
  argTypes: {
    onClose: {
      type: { required: true },
      description: `Close handler function of type: () => void`,
    },
  },
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

const Template: Story<CloseButtonProps> = (args) => <CloseButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  onClose: () => alert('close button clicked'),
};
