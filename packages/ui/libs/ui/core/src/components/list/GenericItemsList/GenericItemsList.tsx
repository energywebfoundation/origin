import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Checkbox,
  List,
  TypographyProps,
  Pagination,
  PaginationProps,
} from '@material-ui/core';
import {
  ListItemsContainer,
  ListItemsContainerProps,
} from '../ListItemsContainer';
import { useStyles } from './GenericItemsList.styles';

export interface GenericItemsListProps<ContainerId, ItemId> {
  listContainers: ListItemsContainerProps<ContainerId, ItemId>[];
  listTitle?: string;
  titleProps?: TypographyProps;
  checkboxes?: boolean;
  allSelected?: boolean;
  selectAllHandler?: () => void;
  selectAllText?: string;
  pagination?: boolean;
  pageSize?: number;
  paginationProps?: PaginationProps;
}

export type TGenericItemsList = <ContainerId, ItemId>(
  props: React.PropsWithChildren<GenericItemsListProps<ContainerId, ItemId>>
) => React.ReactElement;

export const GenericItemsList: TGenericItemsList = ({
  listTitle,
  titleProps,
  checkboxes,
  allSelected,
  selectAllHandler,
  selectAllText,
  listContainers,
  pagination,
  pageSize = 5,
  paginationProps,
}) => {
  const classes = useStyles();
  const [page, setPage] = useState(1);

  function paginate(allItems, itemsPerPage, currentPage) {
    return allItems.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }

  const formattedItems = pagination
    ? paginate(listContainers, pageSize, page)
    : listContainers;

  return (
    <Paper className={classes.paperWrapper}>
      {listTitle && (
        <Typography variant="h4" {...titleProps}>
          {listTitle}
        </Typography>
      )}

      {checkboxes && (
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
        {formattedItems.map((container) => (
          <ListItemsContainer
            key={`container-${container.id}`}
            checkboxes={checkboxes}
            {...container}
          />
        ))}
      </List>

      {pagination && (
        <Pagination
          className={classes.pagination}
          size="small"
          defaultPage={1}
          count={Math.ceil(listContainers.length / pageSize)}
          onChange={(event, index) => setPage(index)}
          {...paginationProps}
        />
      )}
    </Paper>
  );
};
