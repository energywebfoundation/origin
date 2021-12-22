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
import { NavSectionTitle, NavSectionTitleProps } from './NavSectionTitle';

const description =
  'Navigation button used as Section Title in `NavBarSection`';

export default {
  title: 'Navigation / NavSectionTitle',
  component: NavSectionTitle,
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
    buttonClass: {
      description: 'Class supplied to `Button` component',
      control: false,
    },
  },
} as Meta;

const Template: Story<NavSectionTitleProps> = (args) => (
  <NavSectionTitle {...args} />
);

export const Default = Template.bind({});
Default.args = {
  title: 'Section Title',
  url: '/section-title',
};
