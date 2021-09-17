import React from 'react';
import { Meta } from '@storybook/react';
import { Box, Typography } from '@material-ui/core';
import { CardsListBlock, CardsListBlockProps } from './CardsListBlock';
import { CardsListItem } from '../../components/list';

export default {
  title: 'Containers / CardsListBlock',
  component: CardsListBlock,
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

export const WithoutCheckboxes = (args: CardsListBlockProps<number>) => {
  return <CardsListBlock {...args} />;
};

WithoutCheckboxes.args = {
  allItems: [
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
  ],
  Content: BlockContent,
  loading: false,
  listTitle: '',
  checkAllText: '',
  selectOnCardClick: true,
  dragNdrop: false,
};

export const WithCheckboxes = (args: CardsListBlockProps<number>) => {
  return <CardsListBlock {...args} />;
};

WithCheckboxes.args = {
  allItems: [
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
  ],
  Content: BlockContent,
  loading: false,
  listTitle: '',
  checkAllText: 'Select all',
  selectOnCardClick: false,
  dragNdrop: false,
};

export const WithDragNDrop = (args: CardsListBlockProps<number>) => {
  return <CardsListBlock {...args} />;
};

WithDragNDrop.args = {
  allItems: [
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
  ],
  Content: BlockContent,
  loading: false,
  listTitle: '',
  checkAllText: '',
  selectOnCardClick: true,
  handleDrag: (reorderedList) => console.log(reorderedList),
  dragNdrop: true,
};
