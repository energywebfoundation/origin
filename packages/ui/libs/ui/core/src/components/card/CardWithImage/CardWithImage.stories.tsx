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
import { Box, Typography } from '@material-ui/core';
import { AccountBalance } from '@material-ui/icons';
import { CardWithImage, CardWithImageProps } from './CardWithImage';

const description = `
  Component displaying item in card with image. Fallback icon can be provided in case of missing image url. <br />
  When hovering an image part of a card - a tinted overlay appears. Optional text appearing in a middle of a tinted block could be provided. <br />
  As well as an action for clicking the image.
`;

export default {
  title: 'Card / CardWithImage',
  component: CardWithImage,
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
    heading: {
      description: 'Heading of the card',
    },
    content: {
      description: 'Any custom content of a card',
      control: null,
    },
    imageUrl: {
      description: 'URL of the image to be displayed in card',
    },
    hoverText: {
      description: 'Text to display, when hovering an image part',
    },
    onActionClick: {
      description: 'Action function fired when clicking on the image part',
    },
    fallbackIcon: {
      description:
        'SVG icon provided as fallback in case of missing or not loaded image',
      table: {
        type: { summary: 'React.FC<React.SVGProps<SVGSVGElement>>' },
      },
      control: null,
    },
    fallbackIconProps: {
      description: 'Props supplied to svg icon component',
      table: {
        type: { summary: 'React.SVGProps<SVGSVGElement>' },
      },
      control: null,
    },
    fallbackIconWrapperProps: {
      description:
        'Props supplied to the `div` which is wrapping fallback icon',
      control: null,
    },
    cardProps: {
      description:
        'Props for main component: <a href="https://next.material-ui.com/api/card/" target="_blank">`Card`</a>',
      table: {
        type: { summary: 'CardProps' },
      },
      control: null,
    },
    cardActionAreaProps: {
      description:
        'Props supplied to <a href="https://next.material-ui.com/api/card-action-area/" target="_blank">`CardActionArea`</a>. Component which wraps image or fallback icon.',
      table: {
        type: { summary: 'CardActionAreaProps' },
      },
      control: null,
    },
    imageProps: {
      description: 'Props supplied to `img` component',
      table: {
        type: { summary: 'React.ImgHTMLAttributes<HTMLImageElement>' },
      },
      control: null,
    },
    imageWrapperProps: {
      description: 'Props supplied to the `div` which is wrapping image',
      control: null,
    },
    overlayProps: {
      description:
        'Props supplied to the `div` element which is displaying a tinted overlay block on hover',
      control: null,
    },
    overlayTextProps: {
      description:
        'Props supplied to the `div` element which is displaying text inside overlay block on hover',
      control: null,
    },
  },
} as Meta;

const Template: Story<CardWithImageProps> = (args) => (
  <CardWithImage {...args} />
);

export const WithImage = Template.bind({});
WithImage.args = {
  heading: 'Item One',
  content: (
    <Box>
      <Typography>Item description</Typography>
    </Box>
  ),
  imageUrl:
    'https://www.energyweb.org/wp-content/uploads/2019/06/EW-Hero-1-1024x640.jpg',
  hoverText: 'View details',
  onActionClick: () => alert('clicked to view details'),
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  heading: 'Item Two',
  content: (
    <Box>
      <Typography>Item description</Typography>
    </Box>
  ),
  imageUrl: '',
  fallbackIcon: AccountBalance,
  hoverText: 'See detailed',
  onActionClick: () => alert('clicked to see detailed info'),
};
