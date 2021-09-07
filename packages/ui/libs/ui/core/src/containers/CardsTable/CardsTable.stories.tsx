import React from 'react';
import { Meta } from '@storybook/react';
import { CardsTable } from './CardsTable';
import { CardsTableProps } from './CardsTable.types';
import {
  headers,
  rows,
  totalColumnItems,
  TotalHeader,
  verticalHeaders,
} from './mocks';

export default {
  title: 'Containers / CardsTable',
  component: CardsTable,
} as Meta;

export const Default = (args: CardsTableProps<number, string>) => (
  <CardsTable {...args} />
);

Default.args = {
  verticalHeaders: verticalHeaders,
  totalColumnHeader: <TotalHeader />,
  totalColumnItems: totalColumnItems,
  headers: headers,
  rows: rows,
};
