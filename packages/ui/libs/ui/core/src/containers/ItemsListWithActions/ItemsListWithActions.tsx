import React from 'react';
import { Grid } from '@material-ui/core';
import { GenericItemsList, ListActionsBlock } from '../../components';
import { TItemsListWithActions } from './ItemsListWithActions.types';
import { useItemsListWithActionsEffects } from './ItemsListWithActions.effects';

export const ItemsListWithActions: TItemsListWithActions = ({
  containers,
  actions,
  listTitle,
  listTitleProps,
  selectAllText,
  checkboxes,
  pagination,
  pageSize,
  paginationProps,
  itemsGridProps,
  actionsGridProps,
  emptyListComponent,
  actionsTabsProps,
  disabled = false,
}) => {
  const {
    allSelected,
    selectAllHandler,
    listContainers,
    selectedItems,
    resetState,
  } = useItemsListWithActionsEffects({ containers });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7} {...itemsGridProps}>
        <GenericItemsList
          listTitle={listTitle}
          titleProps={listTitleProps}
          selectAllText={selectAllText}
          allSelected={allSelected}
          selectAllHandler={selectAllHandler}
          listContainers={listContainers}
          checkboxes={checkboxes}
          disabled={disabled}
          pagination={pagination}
          pageSize={pageSize}
          paginationProps={paginationProps}
          emptyListComponent={emptyListComponent}
        />
      </Grid>
      <Grid item xs={12} md={5} {...actionsGridProps}>
        <ListActionsBlock
          actions={actions}
          selectedIds={selectedItems}
          resetSelected={resetState}
          tabsProps={actionsTabsProps}
        />
      </Grid>
    </Grid>
  );
};
