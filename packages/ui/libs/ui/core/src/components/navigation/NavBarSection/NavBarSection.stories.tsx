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
import { NavBarSection, NavBarSectionProps } from './NavBarSection';

const description =
  'This component represents a block of navigation items. ' +
  'It consists of Title and Items. ' +
  'Example of such blocks can be found in Origin navigation: Exchange, Device, Organization, User.';

const menuItemTypeDetail = `{
  // nested url. resulting link on click will look like this: /$rootUrl/$url
  url: string;

  // text to be displayed as link
  label: string;

  // If true - will be displayed inside nested links list
  show: boolean;
}`;

export default {
  title: 'Navigation / NavBarSection',
  component: NavBarSection,
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
    show: {
      description: 'Should the component be rendered or not',
    },
    rootUrl: {
      description:
        'The url serving as main url for the whole block of links. Examples: `/organization`, `/user`. Used for handling click on Section Title',
    },
    isOpen: {
      description:
        'If `true` - nested ites will be visible, otherwise only Section Title will be visible.',
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

const sectionMenuList = [
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

const Template: Story<NavBarSectionProps> = (args) => (
  <NavBarSection {...args} />
);

export const Open = Template.bind({});
Open.args = {
  sectionTitle: 'Opened section title',
  show: true,
  rootUrl: '/opened',
  isOpen: true,
  menuList: sectionMenuList,
};

export const Closed = Template.bind({});
Closed.args = {
  sectionTitle: 'Closed section title',
  show: true,
  rootUrl: '/closed',
  isOpen: false,
  menuList: sectionMenuList,
};
