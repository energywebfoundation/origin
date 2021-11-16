import React, { PropsWithChildren, ReactElement } from 'react';
import { BoxProps, CheckboxProps, Grid, TypographyProps } from '@mui/material';
import { GenericCardsList, CardsListItem } from '../../components';
import { useCardsListBlockEffects } from './CardsListBlock.effects';

export interface CardsListBlockProps<Id> {
  allItems: CardsListItem<Id>[];
  Content: React.FC<{ selectedIds: Id[] }>;
  loading?: boolean;
  listTitle?: string;
  listTitleProps?: TypographyProps;
  handleDrag?: (newOrder: CardsListItem<Id>[]) => void | Promise<void>;
  checkAllText?: string;
  selectOnCardClick?: boolean;
  dragNdrop?: boolean;
  listWrapperProps?: BoxProps;
  headerWrapperProps?: BoxProps;
  selectAllCheckboxProps?: CheckboxProps;
}

export type TCardsListBlock = <Id>(
  props: PropsWithChildren<CardsListBlockProps<Id>>
) => ReactElement;

export const CardsListBlock: TCardsListBlock = ({
  allItems,
  Content,
  loading = false,
  listTitle = '',
  listTitleProps,
  handleDrag,
  checkAllText,
  selectOnCardClick = true,
  listWrapperProps,
  headerWrapperProps,
  selectAllCheckboxProps,
  dragNdrop = false,
}) => {
  const { checkedIds, handleCheck, allChecked, handleAllCheck } =
    useCardsListBlockEffects(allItems);
  return (
    <Grid container>
      <Grid item>
        <GenericCardsList
          checkedIds={checkedIds}
          handleCheck={handleCheck}
          allChecked={allChecked}
          handleAllCheck={handleAllCheck}
          allItems={allItems}
          loading={loading}
          handleDrag={handleDrag}
          listTitle={listTitle}
          listTitleProps={listTitleProps}
          checkAllText={checkAllText}
          selectOnCardClick={selectOnCardClick}
          listWrapperProps={listWrapperProps}
          headerWrapperProps={headerWrapperProps}
          selectAllCheckboxProps={selectAllCheckboxProps}
          dragNdrop={dragNdrop}
        />
      </Grid>
      <Grid item>
        <Content selectedIds={checkedIds} />
      </Grid>
    </Grid>
  );
};
