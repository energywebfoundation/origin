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
import { PageNotFound } from './PageNotFound';

const description =
  'Simple placeholder for 404 Not Found page. Built with `Paper`, `Typography` and `Button`. Button click will lead to previous page';

export default {
  title: 'Layout / PageNotFound',
  component: PageNotFound,
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
} as Meta;

const Template: Story = () => <PageNotFound />;

export const Default = Template.bind({});
