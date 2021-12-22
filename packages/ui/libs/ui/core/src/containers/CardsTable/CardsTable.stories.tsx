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
import { CardsTable } from './CardsTable';
import { CardsTableProps } from './CardsTable.types';
import {
  headers,
  rows,
  totalColumnItems,
  TotalHeader,
  verticalHeaders,
} from './mocks';

const description =
  'Component used for creating tables with data located in cards. ' +
  'Consists of vertical headers table on the left, main table and total Table.';

const genericTypeDescription = `{
  id: Id;
  component: React.FC<{ id: Id }>;
}`;

const rowsTypeDecription = `{
  headerId: HeaderId;
  verticalHeaderId: VerticalHeaderId;
  component: React.FC<{
    headerId: HeaderId;
    verticalHeaderId: VerticalHeaderId;
  }>;
}`;

export default {
  title: 'Table / CardsTable',
  component: CardsTable,
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
    verticalHeaders: {
      description:
        'An array of items to be displayed as the Vertical-Headers table on the left.',
      table: {
        type: {
          detail: genericTypeDescription,
          summary: 'TVerticalHeader<Id>[]',
        },
      },
      control: null,
    },
    headers: {
      description: 'Array of table headers for the Main table',
      table: {
        type: {
          summary: 'CardTableHeader<Id>[]',
          detail: genericTypeDescription,
        },
      },
      control: null,
    },
    rows: {
      description:
        'An array containing rows for the Main table body. Each row is also an array of items',
      table: {
        type: {
          detail: rowsTypeDecription,
        },
      },
      control: null,
    },
    totalColumnHeader: {
      description:
        'Header component of the Total table which consists of 1 column.',
      control: null,
    },
    totalColumnItems: {
      description: 'Items displayed in the Total table.',
      table: {
        type: {
          summary: 'TTotalItem<Id>',
          detail: genericTypeDescription,
        },
      },
      control: null,
    },
    verticalHeadersTableProps: {
      description:
        'Props supplied to the `<table>` component of the Vertical-Headers table.',
      control: null,
    },
    verticalHeadersTableHeadCellProps: {
      description:
        'Props supplied to the `<th>` component of the Vertical-Headers table.',
      control: null,
    },
    verticalHeadersTableCellProps: {
      description:
        'Props supplied to the `<td>` component of the Vertical-Headers table.',
      control: null,
    },
    tableWrapperProps: {
      description:
        'Props supplied to the `<div>` component wrapping the Main table.',
      control: null,
    },
    tableProps: {
      description:
        'Props supplied to the `<table>` component of the Main table.',
      control: null,
    },
    tableHeadCellProps: {
      description: 'Props supplied to the `<th>` component of the Main table.',
      control: null,
    },
    tableCellProps: {
      description: 'Props supplied to the `<td>` component of the Main table.',
      control: null,
    },
    tableCellContentWrapperProps: {
      description:
        'Props supplied to the `<div>` component located inside each `<td>` of the Main table.',
      control: null,
    },
    totalTableProps: {
      description:
        'Props supplied to the `<table>` component of the Total table.',
      control: null,
    },
    totalTableHeadCellProps: {
      description: 'Props supplied to the `<th>` component of the Total table.',
      control: null,
    },
    totalTableCellProps: {
      description: 'Props supplied to the `<td>` component of the Total table.',
      control: null,
    },
    totalTableCellContentWrapperProps: {
      description:
        'Props supplied to the `<div>` component located inside each `<td>` of the Total table.',
    },
  },
} as Meta;

const Template: Story<CardsTableProps<number, string>> = (args) => (
  <CardsTable {...args} />
);

export const Default = Template.bind({});
Default.args = {
  verticalHeaders: verticalHeaders,
  totalColumnHeader: <TotalHeader />,
  totalColumnItems: totalColumnItems,
  headers: headers,
  rows: rows,
};
