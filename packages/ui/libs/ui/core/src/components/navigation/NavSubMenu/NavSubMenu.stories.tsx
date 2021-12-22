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
import { NavSubMenu, NavSubMenuProps } from './NavSubMenu';

const description =
  "A list of `MenuItem`'s used as sub-menu in `NavBarSection`";

const menuItemTypeDetail = `{
  // link url. resulting link on click will look like this: /$rootUrl/$url
  url: string;

  // text to be displayed as link
  label: string;

  // If true - will be displayed in links list
  show: boolean;
}`;

export default {
  title: 'Navigation / NavSubMenu',
  component: NavSubMenu,
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
    open: {
      description: 'Should the component be rendered or not',
    },
    rootUrl: {
      description:
        'The url serving as parent url for the whole list of links. Used for composing links',
    },
    menuList: {
      description: "An array of data to be used for nested `MenuItem`'s",
      table: { type: { detail: menuItemTypeDetail } },
    },
    closeMobileNav: {
      description:
        'Function closing the mobile navigation on any item click. Supply in case NavBarSection is used inside mobile navigation.',
    },
    menuButtonClass: {
      description: 'Class to be used for `Button` component of menu items',
      control: false,
    },
    selectedMenuItemClass: {
      description:
        'Class to be used when the menu item has the selected state as `true`',
      control: false,
    },
  },
} as Meta;

const section1MenuList = [
  {
    url: 'menu_item_one',
    label: 'Item one',
    show: true,
  },
  {
    url: 'menu_item_two',
    label: 'Item two',
    show: true,
  },
];

const Template: Story<NavSubMenuProps> = (args) => <NavSubMenu {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
  rootUrl: '/section-one',
  menuList: section1MenuList,
};
