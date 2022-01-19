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
import {
  ImageWithHoverText,
  ImageWithHoverTextProps,
} from './ImageWithHoverText';

const description = `Image with text displayed on hover on a tinted background.`;

export default {
  title: 'Images / ImageWithHoverText',
  component: ImageWithHoverText,
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
    src: {
      description: 'A url of an image',
    },
    text: {
      description: 'Text to be displayed on hover',
    },
    alt: {
      description: '`alt` attribute supplied to `<img />` tag',
    },
    imageWrapperProps: {
      description: 'Props supplied to the wrapper `div`',
      control: false,
    },
    imageProps: {
      description: 'Props supplied to `img` element',
      control: false,
    },
    overlayProps: {
      description:
        'Props supplied to `div` which represent the tinted background on hover',
      control: false,
    },
    overlayTextProps: {
      description:
        'Props supplied to `Typography` component displaying the text on hover',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
  },
} as Meta;

const Template: Story<ImageWithHoverTextProps> = (args) => (
  <ImageWithHoverText {...args} />
);

export const Default = Template.bind({});
Default.args = {
  src: 'https://images.unsplash.com/photo-1560279966-2d681f3d4dfc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80',
  text: 'Aerial photo of Detroit Dam in Oregon by Dan Meyers',
  imageWrapperProps: { style: { width: '600px', height: '450px' } },
  imageProps: { width: '600px', height: '450px' },
};
