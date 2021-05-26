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
}) => {
  const listProps = useItemsListWithActionsEffects({ content });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <GenericItemsList
          listTitle={listTitle}
          selectAllText={selectAllText}
          {...listProps}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <ListActionsBlock actions={actions} />
      </Grid>
    </Grid>
  );
};
