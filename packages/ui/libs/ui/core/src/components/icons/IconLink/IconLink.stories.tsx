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
import { IconLink, IconLinkProps } from './IconLink';

const description = 'Icon which will redirect user to supplied `url` on click.';

export default {
  title: 'Icons / IconLink',
  component: IconLink,
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
    wrapperProps: {
      description: 'Props supplied to the wrapper `Box` component',
      table: {
        type: {
          summary: 'BoxProps',
        },
      },
      control: false,
    },
  },
} as Meta;

const Template: Story<IconLinkProps> = (args) => <IconLink {...args} />;

export const Default = Template.bind({});
Default.args = {
  url: '/',
};
