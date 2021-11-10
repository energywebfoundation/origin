/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import { TableComponent } from './TableComponent';
import { TableComponentProps } from './TableComponent.types';
import {
  ArgsTable,
  Description,
  Primary,
  Stories,
  Title,
  PRIMARY_STORY,
} from '@storybook/addon-docs';

const description =
  'Component used for creating tables. ' +
  'Built with `Table` component from MUI. ' +
  'Consists of Header, Body, Footer and optional Filters block above the table.';

const dataTypeDescription = `
// obligatory property based on which all interaction are happening (actions, clicks, key assignments)
  id: Id;

  // all actions available for the row
  actions?: TableActionData<Id>[];

  // Functional Component provided in case you want custom expandind behaviour of the row on row click
  expandedRowComponent?: FC<{ id: Id }>;

  // normally all other properties of the row should match the schema provided as header data
  [key: string]: any;

  /* example
  fullName: 'John Doe',
  role: 'Manager'
  */

`;

const tableFiltersDescription = `
  // name is used to specify which property of table data to filter
  // e.g. to filter users in table by Full name specify this property as { name: 'fullName' }
  name: string;

  // filtering function which accepts 2 args
  // cellData - data from each rows cell in the according column: rowData[name]
  // filterValue - current filter value from the dedicated Input / Select / Datepicker, etc.
  filterFunc: (cellData: any, filterValue: any) => boolean;

  // component to represent a filter in the Filter Box, normally - Input, Select, Datepicker etc.
  component: FC<{
    value: any;
    handleFilterChange: (newValue: any) => void;
    [key: string]: any;
  }>;

  // supplied value of the filter
  value?: any;
`;

export default {
  title: 'Table / TableComponent',
  component: TableComponent,
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
    data: {
      description:
        'Array containing table data. Data should be grouped on a row basis.',
      table: {
        type: {
          detail: dataTypeDescription,
        },
      },
    },
    header: {
      description:
        'An object containing { key: value }. Where key - is later used to assign properties for TableRowData, and value - is the actual text appearing in the Header block of Table.',
      table: {
        type: {
          detail: 'Example: { fullName: "Full name", role: "Manager" }',
        },
      },
    },
    loading: {},
    tableFilters: {
      description:
        'An array of fully-custom table filters applied to the table data.',
      table: {
        type: {
          detail: tableFiltersDescription,
        },
      },
      control: null,
    },
    tableTitle: {
      description: 'Title to be shown above the table',
    },
    tableTitleProps: {
      table: {
        type: {
          summary: 'TypographyProps',
        },
      },
    },
    pageSize: {
      description: 'Amount of rows on each page of the table',
    },
    onRowClick: {
      description:
        'Function to handle row click and perform some custom actions based on rowId.',
    },
    getCustomRowClassName: {
      description:
        'Function to get some custom className for a row based on its rowId. Allows custom styling of some rows based on certain rules.',
    },
  },
} as Meta;

const Template: Story<TableComponentProps<number>> = (args) => (
  <TableComponent {...args} />
);

export const Default = Template.bind({});
Default.args = {
  header: {
    id: 'ID',
    fullName: 'Full name',
    role: 'Role',
  },
  data: [
    { id: 1, fullName: 'John Doe', role: 'Manager' },
    { id: 3, fullName: 'Jane Brown', role: 'Engineer' },
    { id: 4, fullName: 'Bob Green', role: 'Designer' },
  ],
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
  header: {},
  data: [],
};
