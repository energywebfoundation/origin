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
import { IconButtonProps } from '@material-ui/core';
import { ClearButton } from './ClearButton';

const description = `
  Component used for endAdornment in FormInputs or DatePickers. <br/>
  Props are equal to
  <a target="_blank" href="https://next.material-ui.com/api/icon-button/#main-content">
    IconButton
  </a> component props from Material-UI.
`;

export default {
  title: 'Buttons / ClearButton',
  component: ClearButton,
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

const Template: Story<IconButtonProps> = (args) => <ClearButton {...args} />;

export const Default = Template.bind({});
Default.args = {};
