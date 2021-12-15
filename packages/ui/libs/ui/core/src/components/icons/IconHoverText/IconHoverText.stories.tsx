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
import { WindSelected } from '@energyweb/origin-ui-assets';
import { IconHoverText, IconHoverTextProps } from './IconHoverText';

const description = `
  Icon with optional text displayed on hover over a tinted background.
  Used in other components like CardWithImage and HorizontalCard as a fallback for non-supplied image cases.
`;

export default {
  title: 'Icons / IconHoverText',
  component: IconHoverText,
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
    icon: {
      description:
        'Icon component to be displayed. To match the type - supply SVG imported as React component as in described `@svgr` package',
      control: false,
    },
    hoverText: {
      description:
        'Optional text to be display when user hovers over icon. By default will be displayed over a tinted background',
    },
    wrapperProps: {
      description: 'Props supplied to `div` element wraping the content',
      control: false,
    },
    iconProps: {
      description: 'Props supplied to the Icon',
      control: false,
    },
    overlayProps: {
      description:
        'Props supplied to the `div` component which is responsible for tinted background',
      control: false,
    },
    overlayTextProps: {
      description:
        'Props supplied to the `Typography` component responsible for displaying text on hover',
      table: {
        type: {
          summary: 'TypographyProps',
        },
      },
      control: false,
    },
  },
} as Meta;

const Template: Story<IconHoverTextProps> = (args) => (
  <IconHoverText {...args} />
);

export const Default = Template.bind({});
Default.args = {
  icon: WindSelected,
};

export const WithHoverText = Template.bind({});
WithHoverText.args = {
  icon: WindSelected,
  hoverText: 'This is the Wind farm icon',
};
