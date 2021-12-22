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
import { IconText, IconTextProps } from './IconText';

const description = `Icon with text displayed to the right. Also accepts optional subtitle`;

export default {
  title: 'Icons / IconText',
  component: IconText,
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
    title: {
      description: 'Text to be displayed next to the icon',
    },
    subtitle: {
      description: 'Additional text to be displayed below `title`',
    },
    titleProps: {
      description: 'Props supplied to `Typography` component of `title`',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
    subtitleProps: {
      description: 'Props supplied to `Typography` component of `subtitle`',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
    iconProps: {
      control: false,
    },
    gridContainerProps: {
      description: 'Props supplied to wrapper `Grid` component',
      table: { type: { summary: 'GridProps' } },
      control: false,
    },
  },
} as Meta;

const Template: Story<IconTextProps> = (args) => <IconText {...args} />;

export const Default = Template.bind({});
Default.args = {
  icon: WindSelected,
  title: 'Wind Selected icon',
};

export const WithSubtitle = Template.bind({});
WithSubtitle.args = {
  icon: WindSelected,
  title: 'Wind Selected icon',
  subtitle: 'this is a type of device icons',
};
