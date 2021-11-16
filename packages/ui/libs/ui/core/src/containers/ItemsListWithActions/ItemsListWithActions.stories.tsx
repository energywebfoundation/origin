/* deepscan-disable */
import React from 'react';
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
import { ItemsListWithActions } from './ItemsListWithActions';
import { ItemsListWithActionsProps } from './ItemsListWithActions.types';

const description =
  'Component consisting of Items List and Actions Block.' +
  ' In Items List single layer items can be located (e.g. First container) as well as the nested structure (e.g. Second container).' +
  ' In Actions block custom components can be specified, which consumes the array of the selected items ids.' +
  ' This component mostly usable with checkboxes, though it can be used without them.' +
  ' Component has default responsive behaviour - moving the Actions block below the List on screens smaller than tablet.';

const containersTypeDetail = `Map<ContainerId, {

  // top level element wrapping all items as children
  containerComponent: ReactNode;

  // an Array of items to be located under this container
  // type TItemsListWithActionsItem<ItemId> = { id: ItemId; component: ReactNode; };
  items: TItemsListWithActionsItem<ItemId>[];

  // Props supplied to the root List component of container
  containerListItemProps?: ListItemProps;

  // Props supplied to the nested List component which wraps all items of container
  itemListItemProps?: ListItemProps;
}>`;

const actionsTypeDetail = `{
  // name of the action to be displayed in tabs section
  name: string;

  // should select either content or component

  // static and not reactive to selected items change
  content?: ReactNode;

  // changes rendered content based on the selectedIds
  // accepts 2 props of type ListActionComponentProps<ItemId> =
  // { selectedIds: ItemId[]; resetIds: () => void; }
  component?: React.FC<ListActionComponentProps<ItemId>>;
}`;

export default {
  title: 'List / ItemsListWithActions',
  component: ItemsListWithActions,
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
    containers: {
      description: 'A Map of containers used for building the list',
      table: {
        type: {
          detail: containersTypeDetail,
        },
      },
    },
    actions: {
      description: 'An array of Actions to be available for this list',
      table: {
        type: {
          summary: 'ListAction<ItemId>[]',
          detail: actionsTypeDetail,
        },
      },
      control: null,
    },
    listTitle: {
      description: 'Optional title for the component',
    },
    listTitleProps: {
      description: 'Props supplied to the `Typography` component of title',
      table: {
        type: {
          summary: 'TypographyProps',
        },
      },
      control: null,
    },
    selectAllText: {
      description: 'Optional text located near Select All checkbox',
    },
    checkboxes: {
      description:
        'If `true` - will display checkboxes in each container and item, as well as Select All checkbox',
    },
    pagination: {
      description: 'If `true` - will add the pagination to the list',
    },
    paginationProps: {
      description: 'Props supplied to `Pagination` component',
      control: null,
    },
    pageSize: {
      description:
        'Amount of containers allowed for display on a single page. Works only with `pagination={true}`',
    },
    emptyListComponent: {
      description: 'Optional element displayed in case the list is empty.',
    },
    disabled: {
      description: 'If `true` - disables selection of any containers/items',
    },
    itemsGridProps: {
      description:
        'Props supplied to the `Grid` component wrapping the list of items',
      table: {
        type: {
          summary: 'GridProps',
        },
      },
      control: null,
    },
    actionsGridProps: {
      description:
        'Props supplied to the `Grid` component wrapping the Actions block',
      table: {
        type: {
          summary: 'GridProps',
        },
      },
      control: null,
    },
    actionsTabsProps: {
      description:
        'Props supplied to the `Tabs` component inside the Actions block',
      table: {
        type: {
          summary: 'TabsProps',
        },
      },
      control: null,
    },
  },
} as Meta;

const containers: ItemsListWithActionsProps<number, string>['containers'] =
  new Map();

containers.set(1, {
  containerComponent: <Typography>First container</Typography>,
  items: [
    {
      id: '1',
      component: (
        <Typography>This is the first item of first container</Typography>
      ),
    },
  ],
});
containers.set(2, {
  containerComponent: <Typography>Second container</Typography>,
  items: [
    {
      id: '2',
      component: (
        <Typography>This is the first item of second container</Typography>
      ),
    },
    {
      id: '3',
      component: (
        <Typography>This is the second item of second container</Typography>
      ),
    },
  ],
});

const actions = [
  {
    name: 'Sell',
    content: (
      <Box p={'20px'}>
        <Typography>Sell action text</Typography>
      </Box>
    ),
  },
  {
    name: 'Buy',
    content: (
      <Box p={'20px'}>
        <Typography>Buy action text</Typography>
      </Box>
    ),
  },
];

const EmptyList = () => {
  return (
    <Box
      height={'200px'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Typography textAlign={'center'} component="span" variant="h4">
        List is empty
      </Typography>
    </Box>
  );
};

const Template: Story<ItemsListWithActionsProps<number, string>> = (args) => {
  return <ItemsListWithActions {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  containers: containers,
  actions: actions,
};

export const Title = Template.bind({});
Title.args = {
  containers: containers,
  actions: actions,
  listTitle: 'Items list with actions',
  listTitleProps: { color: 'primary' },
};

export const Checkboxes = Template.bind({});
Checkboxes.args = {
  containers: containers,
  actions: actions,
  checkboxes: true,
  selectAllText: 'Select all items and containers',
};

export const Disabled = Template.bind({});
Disabled.args = {
  containers: containers,
  actions: actions,
  checkboxes: true,
  selectAllText: 'Select all',
  disabled: true,
};

export const Pagination = Template.bind({});
Pagination.args = {
  containers: containers,
  actions: actions,
  pagination: true,
  pageSize: 1,
};

export const EmptyListFallback = Template.bind({});
EmptyListFallback.args = {
  containers: new Map(),
  actions: actions,
  emptyListComponent: <EmptyList />,
};
