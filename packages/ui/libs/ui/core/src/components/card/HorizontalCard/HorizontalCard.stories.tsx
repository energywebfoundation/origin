/* deepscan-disable */
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { Typography } from '@material-ui/core';
import { WindSelected } from '@energyweb/origin-ui-assets';
import { HorizontalCard, HorizontalCardProps } from './HorizontalCard';

const description = `
  Component displaying item in horizontally oriented card. Optional image url can be provided. <br />
  Fallback icon can be provided in case of missing image url. <br />
  Item can be selectable on click. Has default styling for selected card.
`;

export default {
  title: 'Card / HorizontalCard',
  component: HorizontalCard,
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
    header: {
      description:
        'React node with custom content located as a top part of card',
      type: { required: true },
      table: {
        type: { summary: 'ReactNode' },
      },
      control: null,
    },
    content: {
      description:
        'React node with custom content located as a bottom part of the card',
      type: { required: true },
      table: {
        type: { summary: 'ReactNode' },
      },
      control: null,
    },
    imageUrl: {
      description: 'URL of the image to display in card',
      table: {
        type: { summary: 'string' },
      },
      control: { type: 'text' },
    },
    fallbackIcon: {
      description:
        'Icon displayed as fallback in case image url is empty or not loaded',
      table: {
        type: { summary: 'React.FC<React.SVGProps<SVGSVGElement>>' },
      },
    },
    selected: {
      description: 'Selected state of card',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
      control: { type: 'boolean' },
    },
    onClick: {
      description: 'Function called when clicking on card',
      table: {
        type: { summary: '() => void' },
      },
    },
    fallbackIconProps: {
      description: 'Props supplied to svg icon component',
      table: {
        type: { summary: 'React.SVGProps<SVGSVGElement>' },
      },
    },
    fallbackIconWrapperProps: {
      description:
        'Props supplied to the `div` which is wrapping fallback icon',
      control: null,
    },
    cardHeaderProps: {
      description:
        'Props for header part, which is created with <a href="https://next.material-ui.com/api/card-content/" target="_blank">`CardContent`</a> component from MUI',
      table: {
        type: { summary: 'CardContentProps' },
      },
    },
    cardContentProps: {
      description:
        'Props for content part, which is created with <a href="https://next.material-ui.com/api/card-content/" target="_blank">`CardContent`</a> component from MUI',
      table: {
        type: { summary: 'CardContentProps' },
      },
    },
  },
} as Meta;

const Template: Story<HorizontalCardProps> = (args) => (
  <HorizontalCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
  header: <Typography variant="h5">Header</Typography>,
  content: <Typography>Content</Typography>,
};

export const WithImage = Template.bind({});
WithImage.args = {
  onClick: () => console.log('card clicked'),
  selected: false,
  header: <Typography variant="h5">Header</Typography>,
  content: <Typography>Content</Typography>,
  imageUrl:
    'https://energyweb.org/wp-content/uploads/2020/04/red-zeppelin-UVGE-o757-g-unsplash-1080sq.jpg',
};

export const WithFallbackIcon = Template.bind({});
WithFallbackIcon.args = {
  onClick: () => console.log('card clicked'),
  selected: false,
  header: <Typography variant="h5">Header</Typography>,
  content: <Typography>Content</Typography>,
  fallbackIcon: WindSelected,
  fallbackIconProps: { style: { width: 70 } },
};

const SelectableTemplate: Story<HorizontalCardProps> = (args) => {
  const [selected, setSelected] = useState(false);
  return (
    <HorizontalCard
      onClick={() => setSelected(!selected)}
      selected={selected}
      {...args}
    />
  );
};

export const Selectable = SelectableTemplate.bind({});
Selectable.args = {
  header: <Typography variant="h5">Header</Typography>,
  content: <Typography>Content</Typography>,
  imageUrl:
    'https://energyweb.org/wp-content/uploads/2020/04/red-zeppelin-UVGE-o757-g-unsplash-1080sq.jpg',
};
