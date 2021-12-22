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
import { MenuItem, MenuItemProps } from './MenuItem';

const description = 'Simple item to be a part of website navigation.';

export default {
  title: 'Navigation / MenuItem',
  component: MenuItem,
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
      description: 'Selected/Active state of the link. Affects the styling.',
      table: { defaultValue: { summary: false } },
    },
    closeMobileNav: {
      description:
        'Should be supplied if the MenuItem is a part of navigation on mobile menu. It will then close the menu on item click.',
    },
    selectedClass: {
      description: 'ClassName to be applied in case `selected === true`',
      control: false,
    },
    buttonClass: {
      description: 'ClassName supplied to `Button` component',
      control: false,
    },
  },
} as Meta;

const Template: Story<MenuItemProps> = (args) => <MenuItem {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Menu item label',
  url: '/item-link',
};
