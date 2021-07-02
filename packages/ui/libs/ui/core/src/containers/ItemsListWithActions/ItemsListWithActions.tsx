import React from 'react';
import { Grid } from '@material-ui/core';
import { GenericItemsList, ListActionsBlock } from '../../components';
import { TItemsListWithActions } from './ItemsListWithActions.types';
import { useItemsListWithActionsEffects } from './ItemsListWithActions.effects';

export const ItemsListWithActions: TItemsListWithActions = ({
  content,
  actions,
  listTitle,
  selectAllText,
  checkboxes,
  pagination,
  pageSize,
  paginationProps,
  itemsGridProps,
  actionsGridProps,
}) => {
  const { allSelected, selectAllHandler, listContainers } =
    useItemsListWithActionsEffects({ content });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} {...itemsGridProps}>
        <GenericItemsList
          listTitle={listTitle}
          selectAllText={selectAllText}
          allSelected={allSelected}
          selectAllHandler={selectAllHandler}
          listContainers={listContainers}
          checkboxes={checkboxes}
          pagination={pagination}
          pageSize={pageSize}
          paginationProps={paginationProps}
        />
      </Grid>
      <Grid item xs={12} md={6} {...actionsGridProps}>
        <ListActionsBlock actions={actions} />
      </Grid>
    </Grid>
  );
};
