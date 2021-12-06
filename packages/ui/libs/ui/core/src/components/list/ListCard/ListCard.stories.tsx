/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  ArgsTable,
  Description,
  Primary,
  PRIMARY_STORY,
  Stories,
  Title,
} from '@storybook/addon-docs';
import { Typography } from '@mui/material';
import { ListCard, ListCardProps } from './ListCard';

const description =
  'Component for creating selectable cards. Used in `GenericCardsList` and `CardsListBlock`';

const itemTypeDetail = `{
  // item id - used for selectable behaviour
  id: Id;

  // content to be rendered inside the card
  content: React.FC<{ id: Id }>;

  // Props supplied to the root Card element from MUI
  itemCardProps?: CardProps;

  // If true - will render a checkbox inside the card
  checkbox?: boolean;

  // Props supplied to the Box element wrapping the Checkbox element
  checkboxWrapperProps?: BoxProps;

  // Props supplied to the Checkbox element in case checkbox prop is true
  checkboxProps?: Omit<CheckboxProps, 'value' | 'onChange'>;

  // Props suppleid to Box element wrapping the content component
  contentWrapperProps?: BoxProps;
}`;

export default {
  title: 'List / ListCard',
  component: ListCard,
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
    item: {
      description: 'An item to be rendered as a card.',
      table: {
        type: {
          detail: itemTypeDetail,
        },
      },
      control: null,
    },
    selected: {
      description: 'Prop specifying if the card is selected or not.',
    },
    handleSelect: {
      description: 'Function which handles the selection of the card.',
    },
    selectOnCardClick: {
      description: 'If `true` - card can become selected on click.',
    },
  },
} as Meta;

const CardContent = ({ id }: { id: number }) => {
  return <Typography>Card number {id}</Typography>;
};

const Template: Story<ListCardProps<number>> = (args) => <ListCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  item: {
    id: 1,
    content: CardContent,
  },
  selected: false,
  handleSelect: (id: number) => alert(`Card number ${id} selected`),
};

export const Selected = Template.bind({});
Selected.args = {
  item: {
    id: 1,
    content: CardContent,
  },
  selected: true,
  handleSelect: (id: number) => alert(`Card number ${id} selected`),
};

export const Checkbox = Template.bind({});
Checkbox.args = {
  item: {
    id: 1,
    content: CardContent,
    checkbox: true,
  },
  selected: false,
  selectOnCardClick: false,
  handleSelect: (id: number) => alert(`Card number ${id} selected`),
};
