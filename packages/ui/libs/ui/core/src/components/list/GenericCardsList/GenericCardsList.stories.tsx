/* deepscan-disable */
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import {
  ArgsTable,
  Description,
  Primary,
  PRIMARY_STORY,
  Stories,
  Title as StoryTitle,
} from '@storybook/addon-docs';
import { CardsListItem } from '../ListCard';
import { GenericCardsList, GenericCardsListProps } from './GenericCardsList';

const description =
  'Component allowing to build a list of selectable and rotatable cards.';

const allItemsTypeDetail = `{
  // item id
  id: Id;

  // component to be rendered as a card content
  content: React.FC<{ id: Id }>;

  // props passed to the parent Card component
  itemCardProps?: CardProps;

  // If true - checkbox will be displayed inside the card
  checkbox?: boolean;

  // props passed to the Box component wrapping the Checkbox
  checkboxWrapperProps?: BoxProps;

  // props passed to the Checkbox component
  checkboxProps?: Omit<CheckboxProps, 'value' | 'onChange'>;

  // props based to the Box component wrapping the custom content inside Card
  contentWrapperProps?: BoxProps;
}`;

export default {
  title: 'List / GenericCardsList',
  component: GenericCardsList,
  parameters: {
    docs: {
      page: () => (
        <>
          <StoryTitle />
          <Description>{description}</Description>
          <Primary />
          <ArgsTable story={PRIMARY_STORY} />
          <Stories />
        </>
      ),
    },
  },
  argTypes: {
    checkedIds: {
      description: 'And array of selected ids. Normally a state variable.',
      control: null,
    },
    handleCheck: {
      description: 'Function handling a single card select.',
      control: null,
    },
    allItems: {
      description: 'An array of all items to be rendered in the list.',
      control: null,
      table: {
        type: {
          detail: allItemsTypeDetail,
        },
      },
    },
    checkAllText: {
      description:
        'If supplied - will add a Check All checkbox at the top of the cards list with text located to the right.',
    },
    allChecked: {
      description:
        'Prop displaying if all cards are checked. Should be used with `checkAllText`.',
    },
    handleAllCheck: {
      description:
        'Function for handling click on Select All checkbox for selecting all of the available cards. Should be used with `checkAllText`.',
    },
    loading: {
      description: 'Loading state supplied for the cards.',
    },
    listTitle: {
      description: 'Optional title of the component.',
    },
    listTitleProps: {
      description: 'Props supplied to the `Typography` component of the title.',
      table: {
        type: {
          summary: 'TypographyProps',
        },
      },
      control: null,
    },
    selectOnCardClick: {
      description:
        'If `true` - will allow to make card selected on the card click',
    },
    dragNdrop: {
      description:
        'If `true` - will enable drag-n-drop behaviour of the cards allowing the user to rotate the cards. Component is managing the order change on its own, so no need to provide custom handler for this.',
    },
    handleDrag: {
      description:
        'Function to be called after the order is changed and in case you need some actions to be fired. Normally it will be API function to be called for changing order/priority.',
    },
    listWrapperProps: {
      description:
        'Props supplied to the root `Box` component wrapping the whole cards list',
      table: {
        type: {
          summary: 'BoxProps',
        },
      },
      control: null,
    },
    headerWrapperProps: {
      description:
        'Props supplied to the `Box` component wrapping Title and/or Select All checkbox',
      table: {
        type: {
          summary: 'BoxProps',
        },
      },
      control: null,
    },
    selectAllCheckboxProps: {
      description:
        'Props supplied to the `Checkbox` component which handles Select All functionality',
      control: null,
    },
  },
} as Meta;

const CardItemContent: CardsListItem<number>['content'] = ({ id }) => {
  return (
    <Box>
      <Typography>{`Name of item ${id}`}</Typography>
      <Typography>{`Description of item ${id}`}</Typography>
    </Box>
  );
};

const Template: Story<GenericCardsListProps<number>> = (args) => {
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  const handleCheck = (id: number) => {
    if (checkedIds.includes(id)) {
      const newChecked = [...checkedIds].filter(
        (checkedId) => checkedId !== id
      );
      return setCheckedIds(newChecked);
    }
    const newChecked = [...checkedIds, id];
    setCheckedIds(newChecked);
  };

  const allChecked = checkedIds.length === args.allItems.length;

  const handleAllCheck = () => {
    if (allChecked) {
      return setCheckedIds([]);
    }
    const newChecked = args.allItems.map((item) => item.id);
    setCheckedIds(newChecked);
  };

  return (
    <GenericCardsList
      checkedIds={checkedIds}
      handleCheck={handleCheck}
      allChecked={allChecked}
      handleAllCheck={handleAllCheck}
      {...args}
    />
  );
};

const items = [
  {
    id: 1,
    content: CardItemContent,
  },
  {
    id: 2,
    content: CardItemContent,
  },
  {
    id: 3,
    content: CardItemContent,
  },
];

const itemsWithCheckboxes = [
  {
    id: 1,
    content: CardItemContent,
    checkbox: true,
  },
  {
    id: 2,
    content: CardItemContent,
    checkbox: true,
  },
  {
    id: 3,
    content: CardItemContent,
    checkbox: true,
  },
];

export const Default = Template.bind({});
Default.args = {
  allItems: items,
};

export const Loading = Template.bind({});
Loading.args = {
  allItems: items,
  loading: true,
};

export const Title = Template.bind({});
Title.args = {
  allItems: itemsWithCheckboxes,
  listTitle: 'Simple cards list',
  listTitleProps: { color: 'primary', margin: '0px auto 20px' },
};

export const Checkboxes = Template.bind({});
Checkboxes.args = {
  allItems: itemsWithCheckboxes,
  checkAllText: 'Select all',
  headerWrapperProps: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  selectOnCardClick: false,
};

export const DragNDrop = Template.bind({});
DragNDrop.args = {
  allItems: items,
  selectOnCardClick: true,
  handleDrag: (reorderedList) => {
    console.log(reorderedList);
  },
  dragNdrop: true,
};
