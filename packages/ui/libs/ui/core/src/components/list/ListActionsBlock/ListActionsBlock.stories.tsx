/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Typography, Box } from '@mui/material';
import {
  ArgsTable,
  Description,
  Primary,
  PRIMARY_STORY,
  Stories,
  Title,
} from '@storybook/addon-docs';
import { ListActionsBlock, ListActionsBlockProps } from './ListActionsBlock';

const description =
  'A component used for displaying tabs and the corresponding component/element below the tab. Component has built-in functionality for handling tabs change state.';

const actionsTypeDescription = `{
  // a name of the action to be displayed as tab title
  name: string;

  /* should select either "content" or "component" */

  // static and not reactive to selected items change
  content?: ReactNode;

  // changes rendered content based on the selectedIds
  component?: React.FC<{
    selectedIds: ItemId[];
    resetIds?: () => void;
  }>;
}`;

export default {
  title: 'List / ListActionsBlock',
  component: ListActionsBlock,
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
    actions: {
      description: 'An array of items to be rendered.',
      table: {
        type: {
          detail: actionsTypeDescription,
        },
      },
      control: null,
    },
    selectedIds: {
      description:
        'An array of selected items ids. Should be supplied in case you are using "component" in one of the actions.',
      control: null,
    },
    resetSelected: {
      description: 'A function to reset all selected ids.',
      control: null,
    },
    setSelectedTab: {
      description:
        '`setState` function supplied in case handling of the tabs change is required outside of this component.',
      control: null,
    },
    selectedTab: {
      description:
        'Value of the state variable supplied alongside with `setSelectedTab` in case handling of the tabs change is required outside of this component',
    },
    wrapperProps: {
      description:
        "Props supplied to `div` element wrapping the Tabs and action content's elements.",
      control: null,
    },
    tabsProps: {
      description: 'Props supplied to `Tabs` element from MUI',
      table: {
        type: {
          summary: 'TabsProps',
        },
      },
      control: null,
    },
  },
} as Meta;

const Template: Story<ListActionsBlockProps> = (args) => (
  <ListActionsBlock {...args} />
);

const actions = [
  {
    name: 'Sell',
    content: (
      <Box p="20px">
        <Typography>Sell action text</Typography>
      </Box>
    ),
  },
  {
    name: 'Buy',
    content: (
      <Box p="20px">
        <Typography>Buy action text</Typography>
      </Box>
    ),
  },
];

export const Default = Template.bind({});
Default.args = {
  actions,
};
