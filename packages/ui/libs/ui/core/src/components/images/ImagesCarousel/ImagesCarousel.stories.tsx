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
import { ImagesCarousel, ImagesCarouselProps } from './ImagesCarousel';

const description =
  'Simple images gallery changing pictures every 5 seconds by default.';

export default {
  title: 'Images / ImagesCarousel',
  component: ImagesCarousel,
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
    images: {
      description: 'An array of image urls',
    },
    refreshInterval: {
      description: 'An interval between image changes in ms',
    },
    imagesProps: {
      description:
        'Props supplied to `img` tag of each image. Use it for styling and adjusting the size of images.',
      control: false,
    },
  },
} as Meta;

const Template: Story<ImagesCarouselProps> = (args) => (
  <ImagesCarousel {...args} />
);

export const Default = Template.bind({});
Default.args = {
  images: [
    'https://images.unsplash.com/photo-1548337138-e87d889cc369?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2096&q=80',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80',
  ],
  imagesProps: { width: '600px' },
};
