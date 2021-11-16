/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import { CardsListBlock, CardsListBlockProps } from './CardsListBlock';
import { CardsListItem } from '../../components/list';
import {
  ArgsTable,
  Description,
  Primary,
  PRIMARY_STORY,
  Stories,
  Title as StoriesTitle,
} from '@storybook/addon-docs';

const description =
  'Component with selectable cards and custom content to be displayed to the right.';

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
  title: 'List / CardsListBlock',
  component: CardsListBlock,
  parameters: {
    docs: {
      page: () => (
        <>
          <StoriesTitle />
          <Description>{description}</Description>
          <Primary />
          <ArgsTable story={PRIMARY_STORY} />
          <Stories />
        </>
      ),
    },
  },
  argTypes: {
    allItems: {
      description: 'Array of items to be displayed as cards',
      table: {
        type: {
          detail: allItemsTypeDetail,
        },
      },
      control: null,
    },
    Content: {
      description: 'React component rendered to the right of the cards list',
      table: {
        type: {
          summary: 'React.FC<{ selectedIds: Id[] }>',
        },
      },
      control: null,
    },
    loading: {
      description: 'Loading state supplied for the cards',
    },
    listTitle: {
      description: 'Optional title of the component',
    },
    listTitleProps: {
      description: 'Props supplied to the `Typography` component of the title',
      table: {
        type: {
          summary: 'TypographyProps',
        },
      },
      control: null,
    },
    checkAllText: {
      description:
        'If supplied - will add a Check All checkbox at the top of the cards list with text located to the right',
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

const BlockContent: CardsListBlockProps<number>['Content'] = ({
  selectedIds,
}) => {
  return (
    <Box m={4}>
      <Typography>
        {`Currently selected ID's: ${selectedIds.join(', ')}`}
      </Typography>
    </Box>
  );
};

const CardItemContent: CardsListItem<number>['content'] = ({ id }) => {
  return (
    <Box>
      <Typography>{`Name of item ${id}`}</Typography>
      <Typography>{`Description of item ${id}`}</Typography>
    </Box>
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

const Template: Story<CardsListBlockProps<number>> = (args) => {
  return <CardsListBlock {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  allItems: items,
  Content: BlockContent,
};

export const Checkboxes = Template.bind({});
Checkboxes.args = {
  allItems: itemsWithCheckboxes,
  Content: BlockContent,
  checkAllText: 'Select all',
  selectOnCardClick: false,
  dragNdrop: false,
};

export const DragNDrop = Template.bind({});
DragNDrop.args = {
  allItems: items,
  Content: BlockContent,
  selectOnCardClick: true,
  handleDrag: (reorderedList) => {
    console.log(reorderedList);
  },
  dragNdrop: true,
};

export const Loading = Template.bind({});
Loading.args = {
  allItems: items,
  Content: BlockContent,
  loading: true,
};

export const Title = Template.bind({});
Title.args = {
  allItems: items,
  Content: BlockContent,
  listTitle: 'Selectable cards',
  listTitleProps: { mb: '15px' },
};
