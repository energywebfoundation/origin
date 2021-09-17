/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import { ThemeSwitcher } from './ThemeSwitcher';

export default {
  title: 'Layout / ThemeSwitcher',
  component: ThemeSwitcher,
} as Meta;

const Template: Story = (args) => <ThemeSwitcher {...args} />;

export const Default = Template.bind({});
Default.args = {};
