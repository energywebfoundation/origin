import React from 'react';
import { Box, Typography } from '@material-ui/core';
import {
  CardTableHeader,
  CardTableItem,
  TTotalItem,
  TVerticalHeader,
} from '../../components';

const VerticalHeaderComponent: React.FC<{ id: number }> = ({ id }) => {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      style={{ backgroundColor: id === 0 ? '#F2F7CF' : '#D9D9D9' }}
    >
      <Typography color="InfoText">
        {id === 0 ? 'Total:' : `Consumer ${id}`}
      </Typography>
    </Box>
  );
};

export const verticalHeaders: TVerticalHeader<number>[] = [
  {
    id: 1,
    component: VerticalHeaderComponent,
  },
  {
    id: 2,
    component: VerticalHeaderComponent,
  },
  {
    id: 3,
    component: VerticalHeaderComponent,
  },
  {
    id: 0,
    component: VerticalHeaderComponent,
  },
];

export const TotalHeader = () => {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      style={{ backgroundColor: '#F2F7CF' }}
    >
      <Typography color="InfoText">Total:</Typography>
    </Box>
  );
};

const TotalItemComponent: React.FC<{ id: number }> = ({ id }) => {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      style={{ backgroundColor: '#F2F7CF' }}
    >
      <Box>
        <Typography color="InfoText">
          {id === 0 ? 'Total for all consumers:' : `For consumer ${id}:`}
        </Typography>
        <Typography color="InfoText">
          {id === 0 ? 'Total:6000 MWh' : `Total - ${id * 1000} MWh`}
        </Typography>
      </Box>
    </Box>
  );
};

export const totalColumnItems: TTotalItem<number>[] = [
  {
    id: 1,
    component: TotalItemComponent,
  },
  {
    id: 2,
    component: TotalItemComponent,
  },
  {
    id: 3,
    component: TotalItemComponent,
  },
  {
    id: 0,
    component: TotalItemComponent,
  },
];

const HeaderComponent: React.FC<{ id: string }> = ({ id }) => {
  const idToDisplay = id.split('-').join(' ').toUpperCase();
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      style={{ backgroundColor: '#D9D9D9' }}
    >
      <Typography color="InfoText">{idToDisplay}</Typography>
    </Box>
  );
};

export const headers: CardTableHeader<string>[] = [
  {
    id: 'device-1',
    component: HeaderComponent,
  },
  {
    id: 'device-2',
    component: HeaderComponent,
  },
  {
    id: 'device-3',
    component: HeaderComponent,
  },
];

const TableCellComponent: React.FC<{
  headerId: string;
  verticalHeaderId: number;
}> = ({ headerId, verticalHeaderId }) => {
  if (verticalHeaderId === 0) {
    return (
      <Box
        width="100%"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        style={{ backgroundColor: '#F2F7CF' }}
      >
        <Box>
          <Typography color="InfoText">Total for device ID:</Typography>
          <Typography color="InfoText">{headerId}</Typography>
        </Box>
      </Box>
    );
  }
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      style={{ backgroundColor: '#D9D9D9' }}
    >
      <Box>
        <Typography color="InfoText">Device ID: {headerId}</Typography>
        <Typography color="InfoText">
          Consumer ID: {verticalHeaderId}
        </Typography>
      </Box>
    </Box>
  );
};

export const rows: CardTableItem<string, number>[][] = [
  [
    {
      headerId: 'device-1',
      verticalHeaderId: 1,
      component: TableCellComponent,
    },
    {
      headerId: 'device-2',
      verticalHeaderId: 1,
      component: TableCellComponent,
    },
    {
      headerId: 'device-3',
      verticalHeaderId: 1,
      component: TableCellComponent,
    },
  ],
  [
    {
      headerId: 'device-1',
      verticalHeaderId: 2,
      component: TableCellComponent,
    },
    {
      headerId: 'device-2',
      verticalHeaderId: 2,
      component: TableCellComponent,
    },
    {
      headerId: 'device-3',
      verticalHeaderId: 2,
      component: TableCellComponent,
    },
  ],
  [
    {
      headerId: 'device-1',
      verticalHeaderId: 3,
      component: TableCellComponent,
    },
    {
      headerId: 'device-2',
      verticalHeaderId: 3,
      component: TableCellComponent,
    },
    {
      headerId: 'device-3',
      verticalHeaderId: 3,
      component: TableCellComponent,
    },
  ],
  [
    {
      headerId: 'device-1',
      verticalHeaderId: 0,
      component: TableCellComponent,
    },
    {
      headerId: 'device-2',
      verticalHeaderId: 0,
      component: TableCellComponent,
    },
    {
      headerId: 'device-3',
      verticalHeaderId: 0,
      component: TableCellComponent,
    },
  ],
];
