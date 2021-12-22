/* deepscan-disable */
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { ThemeSwitcher, ThemeSwitcherProps } from './ThemeSwitcher';

const description = 'Switch for theme mode (Dark -> Light)';

export default {
  title: 'Layout / ThemeSwitcher',
  component: ThemeSwitcher,
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
    selected: {
      description: 'Switch state',
      table: { type: { summary: 'boolean' } },
      type: { name: 'boolean', required: true },
    },
    handleThemeChange: {
      description: 'Function handling switch state change',
      table: { type: { summary: '() => void' } },
      type: { name: 'function', required: true },
    },
    switchProps: {
      description: 'Props supplied to `Switch` component',
      table: { type: { summary: "Omit<SwitchProps, 'checked' | 'onChange'>" } },
    },
  },
} as Meta;

const Template: Story<ThemeSwitcherProps> = (args) => (
  <ThemeSwitcher {...args} />
);

export const Default = Template.bind({});
Default.args = {
  selected: false,
  handleThemeChange: () => {},
};

const ControlledTemplate: Story = () => {
  const [selected, setSelected] = useState(false);
  return (
    <ThemeSwitcher
      selected={selected}
      handleThemeChange={() => setSelected(!selected)}
    />
  );
};
export const Controlled = ControlledTemplate.bind({});
