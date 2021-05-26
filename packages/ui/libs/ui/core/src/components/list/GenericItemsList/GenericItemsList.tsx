import React from 'react';
import { Paper, Typography, Checkbox, List } from '@material-ui/core';
import {
  ListItemsContainer,
  ListItemsContainerProps,
} from '../ListItemsContainer';
import { useStyles } from './GenericItemsList.styles';

export interface GenericItemsListProps<ContainerId, ItemId> {
  listContainers: ListItemsContainerProps<ContainerId, ItemId>[];
  listTitle?: string;
  allSelected?: boolean;
  selectAllHandler?: () => void;
  selectAllText?: string;
}

export type TGenericItemsList = <ContainerId, ItemId>(
  props: React.PropsWithChildren<GenericItemsListProps<ContainerId, ItemId>>
) => React.ReactElement;

export const GenericItemsList: TGenericItemsList = ({
  listTitle,
  allSelected,
  selectAllHandler,
  selectAllText,
  listContainers,
}) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paperWrapper}>
      {listTitle && <Typography variant="h4">{listTitle}</Typography>}

      {selectAllHandler && (
        <div className={classes.selectAllHolder}>
          <Checkbox
            color="primary"
            checked={allSelected}
            onChange={selectAllHandler}
          />
          <Typography>{selectAllText || ''}</Typography>
        </div>
      )}

      <List>
        {listContainers.map((container) => (
          <ListItemsContainer
            key={`container-${container.id}`}
            {...container}
          />
        ))}
      </List>
    </Paper>
  );
};
