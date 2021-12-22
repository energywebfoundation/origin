/* deepscan-disable */
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import { GenericItemsList, GenericItemsListProps } from './GenericItemsList';
import {
  ArgsTable,
  Description,
  Primary,
  PRIMARY_STORY,
  Stories,
  Title as StoryTitle,
} from '@storybook/addon-docs';

const description =
  'List with double layered list items. Double layered means [ Container -> Items ] structure. Built with `ListItemsContainer`.';

const listContainersTypeDetail = `{
  /* See "ListItemsContainer" for more details on these props */

  id: ContainerId;
  containerHeader: React.ReactNode;
  containerItems: ListItemComponentProps<ItemId>[];
  checkboxes?: boolean;
  isChecked?: boolean;
  handleContainerCheck?: (id: ContainerId) => void;
  containerListItemProps?: ListItemProps;
  itemListItemProps?: ListItemProps;
  disabled?: boolean;
}`;

export default {
  title: 'List / GenericItemsList',
  component: GenericItemsList,
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
    listContainers: {
      description: 'An array of container to be rendered as list items',
      type: {
        required: true,
        name: 'other',
        value: 'ListItemsContainerProps<ContainerId, ItemId>[]',
      },
      table: {
        type: {
          summary: 'ListItemsContainerProps<ContainerId, ItemId>[]',
          detail: listContainersTypeDetail,
        },
      },
      control: null,
    },
    listTitle: {
      description: 'Title for the list',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
      control: { type: 'text' },
    },
    titleProps: {
      description: 'Props supplied to Typography element from MUI',
      table: {
        type: { summary: 'TypographyProps' },
      },
    },
    checkboxes: {
      description:
        'If `true` - all containers will have checkboxes and the "Select All" checkbox will be rendered above the list',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
      control: { type: 'boolean' },
    },
    allSelected: {
      description:
        'State of "Select All" checkbox. Should be supplied alongside `checkboxes={true}`',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
      control: { type: 'boolean' },
    },
    selectAllHandler: {
      description:
        'Function handling click on "Select All" checkbox. Should be supplied alongside `checkboxes={true}`',
      table: {
        type: { summary: '() => void | null' },
      },
    },
    selectAllText: {
      description:
        'Text located to the right of the "Select All" checkbox. Can be supplied if `checkboxes={true}`',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
      control: { type: 'text' },
    },
    disabled: {
      description:
        'If `true` - all checkboxes in the list will be disabled. Can be supplied if `checkboxes={true}`',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
      control: { type: 'boolean' },
    },
    pagination: {
      description:
        'If `true` - List will have pagination. It will be located at the bottom of the list.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
      control: { type: 'boolean' },
    },
    pageSize: {
      description:
        'The size of the single page. Affects the amount of containers displayed on the single page. Should be supplied alongside `pagination={true}`',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 5 },
      },
      control: { type: 'number' },
    },
    paginationProps: {
      description:
        'Props supplied to the Pagination element from MUI. Can be supplied if `pagination={true}`',
      table: {
        type: { summary: 'PaginationProps' },
      },
    },
    emptyListComponent: {
      description: 'Fallback component rendered in case the list is empty.',
      table: {
        type: { summary: 'ReactNode | null' },
        defaultValue: { summary: 'null' },
      },
    },
  },
} as Meta;

const containers = [
  {
    id: 1,
    containerHeader: <Typography>Container Header 1</Typography>,
    containerItems: [
      {
        id: 'a1',
        itemContent: <Typography>Item A1</Typography>,
      },
    ],
  },
  {
    id: 2,
    containerHeader: <Typography>Container Header 2</Typography>,
    containerItems: [
      {
        id: 'a2',
        itemContent: <Typography>Item A2</Typography>,
      },
      {
        id: 'b2',
        itemContent: <Typography>Item B2</Typography>,
      },
    ],
  },
  {
    id: 3,
    containerHeader: <Typography>Container Header 3</Typography>,
    containerItems: [
      {
        id: 'a3',
        itemContent: <Typography>Item A3</Typography>,
      },
      {
        id: 'b3',
        itemContent: <Typography>Item B3</Typography>,
      },
      {
        id: 'c3',
        itemContent: <Typography>Item C3</Typography>,
      },
    ],
  },
];

const EmptyList = () => {
  return (
    <Box
      height={'100px'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Typography component="span" variant="h5" color="primary">
        List is empty
      </Typography>
    </Box>
  );
};

const Template: Story<GenericItemsListProps<number, string>> = (args) => {
  const [state, setState] = useState<{ containers: number[]; items: string[] }>(
    {
      containers: [],
      items: [],
    }
  );
  const allSelected = state.containers.length === args.listContainers.length;

  const selectAllHandler = () => {
    if (allSelected) {
      setState({ containers: [], items: [] });
    } else {
      setState({
        containers: args.listContainers.map((container) => container.id),
        items: args.listContainers.flatMap((container) =>
          container.containerItems.map((item) => item.id)
        ),
      });
    }
  };

  const handleContainerCheck = (id: number) => {
    const alreadyChecked = state.containers.includes(id);
    const containerItemsIds = args.listContainers.flatMap((container) => {
      if (container.id === id) {
        return container.containerItems.map((item) => item.id);
      }
    });

    if (alreadyChecked) {
      setState({
        containers: state.containers.filter(
          (containerId) => containerId !== id
        ),
        items: state.items.filter(
          (itemId) => !containerItemsIds.includes(itemId)
        ),
      });
    } else {
      setState({
        containers: [...state.containers, id],
        items: [...state.items, ...containerItemsIds],
      });
    }
  };

  const handleItemCheck = (id: string) => {
    const isItemChecked = state.items.includes(id);
    const parentContainer = args.listContainers.find((container) => {
      return (
        container.containerItems.filter((item) => item.id === id)?.length > 0
      );
    });

    if (!isItemChecked) {
      const allItemsIdsFromContainer = parentContainer.containerItems.map(
        (item) => item.id
      );
      const stateWithThisIdAdded = [...state.items, id];
      const willAllItemsOfContainerBeCheckedAfterThisCheck =
        allItemsIdsFromContainer.every((itemId) => {
          return stateWithThisIdAdded.includes(itemId);
        });

      if (willAllItemsOfContainerBeCheckedAfterThisCheck) {
        setState({
          containers: [...state.containers, parentContainer.id],
          items: stateWithThisIdAdded,
        });
      } else {
        setState({
          ...state,
          items: stateWithThisIdAdded,
        });
      }
    } else {
      const isContainerChecked = state.containers.includes(parentContainer.id);
      const stateItemsWithoutThisItem = state.items.filter(
        (itemId) => itemId !== id
      );

      if (isContainerChecked) {
        setState({
          containers: state.containers.filter(
            (containerId) => containerId !== parentContainer.id
          ),
          items: stateItemsWithoutThisItem,
        });
      } else {
        setState({
          ...state,
          items: stateItemsWithoutThisItem,
        });
      }
    }
  };

  const enrichedContainers = args.checkboxes
    ? args.listContainers.map((container) => ({
        ...container,
        isChecked: state.containers.includes(container.id),
        handleContainerCheck: handleContainerCheck,
        containerItems: container.containerItems.map((item) => ({
          ...item,
          itemChecked: state.items.includes(item.id),
          handleItemCheck: handleItemCheck,
        })),
      }))
    : args.listContainers;

  return (
    <GenericItemsList
      {...args}
      allSelected={allSelected}
      selectAllHandler={selectAllHandler}
      listContainers={enrichedContainers}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  listContainers: containers,
};

export const Title = Template.bind({});
Title.args = {
  listContainers: containers,
  listTitle: 'Items list title',
  titleProps: { color: 'textSecondary' },
};

export const Checkboxes = Template.bind({});
Checkboxes.args = {
  listContainers: containers,
  checkboxes: true,
  selectAllText: 'Select all',
};

export const Pagination = Template.bind({});
Pagination.args = {
  listContainers: containers,
  pagination: true,
  pageSize: 1,
};

export const EmptyListFallback = Template.bind({});
EmptyListFallback.args = {
  listContainers: [],
  emptyListComponent: <EmptyList />,
};
