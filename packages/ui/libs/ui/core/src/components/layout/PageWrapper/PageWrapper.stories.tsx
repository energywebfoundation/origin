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
import { PageWrapper, PageWrapperProps } from './PageWrapper';

const description =
  'Wrapper for each page. Built to be used in MainLayout component with Desktop/Mobile nav and Topbar. ' +
  "Main styles are: `display: 'flex', justifyContent: 'center', overflow: 'hidden'` " +
  "`[theme.breakpoints.up('lg')]: padding: '40px 30px 40px 230px' }` " +
  "`[theme.breakpoints.down('lg')]: { padding: '80px 10% 30px' }`";

export default {
  title: 'Layout / PageWrapper',
  component: PageWrapper,
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
    children: {
      control: false,
    },
  },
} as Meta;

const Template: Story<PageWrapperProps> = (args) => <PageWrapper {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: <span>Children content</span>,
};
