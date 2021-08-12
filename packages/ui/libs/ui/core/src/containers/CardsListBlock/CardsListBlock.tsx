import React, { PropsWithChildren, ReactElement } from 'react';
import { Grid } from '@material-ui/core';
import { GenericCardsListProps, GenericCardsList } from '../../components';
import { useCardsListBlockEffects } from './CardsListBlock.effects';

export interface CardsListBlockProps<Id> {
  allItems: GenericCardsListProps<Id>['allItems'];
  loading: GenericCardsListProps<Id>['loading'];
  Content: React.FC<{ selectedIds: Id[] }>;
  listTitle?: GenericCardsListProps<Id>['listTitle'];
  listTitleProps?: GenericCardsListProps<Id>['listTitleProps'];
  handleDrag?: GenericCardsListProps<Id>['handleDrag'];
  checkAllText?: GenericCardsListProps<Id>['checkAllText'];
  selectOnCardClick?: GenericCardsListProps<Id>['selectOnCardClick'];
  dragNdrop?: GenericCardsListProps<Id>['dragNdrop'];
  listWrapperProps?: GenericCardsListProps<Id>['listWrapperProps'];
  headerWrapperProps?: GenericCardsListProps<Id>['headerWrapperProps'];
  selectAllCheckboxProps?: GenericCardsListProps<Id>['selectAllCheckboxProps'];
}

export type TCardsListBlock = <Id>(
  props: PropsWithChildren<CardsListBlockProps<Id>>
) => ReactElement;

export const CardsListBlock: TCardsListBlock = ({
  allItems,
  loading,
  Content,
  listTitle,
  listTitleProps,
  handleDrag,
  checkAllText,
  selectOnCardClick,
  listWrapperProps,
  headerWrapperProps,
  selectAllCheckboxProps,
  dragNdrop,
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
