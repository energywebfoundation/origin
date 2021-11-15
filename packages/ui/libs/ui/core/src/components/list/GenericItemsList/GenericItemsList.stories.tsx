/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Typography } from '@mui/material';
import { GenericItemsList, GenericItemsListProps } from './GenericItemsList';
import {
  ArgsTable,
  Description,
  Primary,
  PRIMARY_STORY,
  Stories,
  Title,
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
    listContainers: {
      description: 'An array of container to be rendered as list items',
      type: {
        required: true,
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

const Template: Story<GenericItemsListProps<number, string>> = (args) => {
  return <GenericItemsList {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  listContainers: [
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
  ],
};
