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
import { BlockTintedBottom, BlockTintedBottomProps } from './BlockTintedBottom';

const description = `Wrapper providing the tinted bottom to the wrapped component`;

export default {
  title: 'Layout / BlockTintedBottom',
  component: BlockTintedBottom,
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
      type: { name: 'other', value: 'ReactNode', required: true },
      control: null,
    },
  },
} as Meta;

const Template: Story<BlockTintedBottomProps> = (args) => (
  <BlockTintedBottom {...args} />
);

export const Default = Template.bind({});
Default.args = {
  children: <div style={{ height: '250px', backgroundColor: '#72d668' }}></div>,
};
