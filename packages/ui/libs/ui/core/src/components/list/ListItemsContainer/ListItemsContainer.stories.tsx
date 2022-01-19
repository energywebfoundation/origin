/* deepscan-disable */
import React from 'react';
import { Typography } from '@mui/material';
import { Meta, Story } from '@storybook/react';
import {
  ArgsTable,
  Description,
  Primary,
  PRIMARY_STORY,
  Stories,
  Title,
} from '@storybook/addon-docs';
import {
  ListItemsContainer,
  ListItemsContainerProps,
} from './ListItemsContainer';

const description =
  'Component representing a container with one or multiple nested items. Used in `GenericItemsList` and `ItemsListWithActions`.';

const containerItemsTypeDetail = `{
  // item id
  id: Id;

  // Element to be rendered as an item content
  itemContent: ReactNode;

  // If true - item will have a checkbox element inside
  checkboxes?: boolean;

  // Prop specifying if the item is checked. Supplied alongside "checkboxes" === true
  itemChecked?: boolean;

  // Function handling the click on item's checkbox. Supplied alongside "checkboxes" === true
  handleItemCheck?: (id: Id) => void;

  // Props supplied to the root ListItem element from MUI
  listItemProps?: ListItemProps;

  // If true and "checkboxes" === true - will disable Checkbox element
  disabled?: boolean;
}`;

export default {
  title: 'List / ListItemsContainer',
  component: ListItemsContainer,
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
    id: {
      type: { required: true, name: 'other', value: 'ContainerId' },
      table: {
        type: {
          summary: 'ContainerId',
        },
      },
    },
    containerHeader: {
      description: 'Element to be displayed as container header.',
      type: { required: true, name: 'other', value: 'ReactNode' },
      control: null,
      table: {
        type: {
          summary: 'ReactNode',
        },
      },
    },
    containerItems: {
      description: 'An array of items which are rendered inside the container.',
      type: {
        required: true,
        name: 'other',
        value: 'ListItemComponentProps<ItemId>[]',
      },
      table: {
        type: {
          summary: 'ListItemComponentProps<ItemId>[]',
          detail: containerItemsTypeDetail,
        },
      },
      control: null,
    },
    checkboxes: {
      description:
        'If `true` - checkboxes will be added for both container and nested items.',
      table: {
        defaultValue: {
          summary: 'false',
        },
        type: {
          summary: 'boolean',
        },
      },
      control: {
        type: 'boolean',
      },
    },
    isChecked: {
      description:
        'Prop specifying if the container checkbox is checked. Should be supplied alongside `checkboxes={true}`',
      table: {
        defaultValue: {
          summary: 'false',
        },
        type: {
          summary: 'boolean',
        },
      },
      control: {
        type: 'boolean',
      },
    },
    handleContainerCheck: {
      description:
        'Function handling container checkbox click. Should be supplied alongside `checkboxes={true}`',
      table: {
        type: {
          summary: '(id: ContainerId) => void',
        },
      },
    },
    disabled: {
      description:
        'If `true` - checkboxes will be disabled in both container and its nested items. Can be supplied if `checkboxes={true}`',
      table: {
        defaultValue: {
          summary: 'false',
        },
        type: {
          summary: 'boolean',
        },
      },
      control: {
        type: 'boolean',
      },
    },
    containerListItemProps: {
      description: "Props supplied container's ListItem element.",
      table: {
        type: {
          summary: 'ListItemProps',
        },
      },
    },
    itemListItemProps: {
      description: 'Props supplied to the ListItem elements of nested items.',
      table: {
        type: {
          summary: 'ListItemProps',
        },
      },
    },
  },
} as Meta;

const Template: Story<ListItemsContainerProps<number, string>> = (args) => {
  return <ListItemsContainer {...args} />;
};

const items = [
  {
    id: 'abc',
    itemContent: <Typography>First item of container</Typography>,
  },
  {
    id: 'efg',
    itemContent: <Typography>Second item of container</Typography>,
  },
];

const header = <Typography>Container header</Typography>;

export const Default = Template.bind({});
Default.args = {
  id: 1,
  containerHeader: header,
  containerItems: items,
};

export const Checkboxes = Template.bind({});
Checkboxes.args = {
  id: 1,
  containerHeader: header,
  containerItems: items,
  checkboxes: true,
};

export const Checked = Template.bind({});
Checked.args = {
  id: 1,
  containerHeader: header,
  containerItems: items,
  checkboxes: true,
  isChecked: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  id: 1,
  containerHeader: header,
  containerItems: items,
  checkboxes: true,
  isChecked: true,
  disabled: true,
};
