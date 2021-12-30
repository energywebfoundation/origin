import React, { ReactNode, useState } from 'react';
import {
  Paper,
  Typography,
  Checkbox,
  List,
  TypographyProps,
  Pagination,
  PaginationProps,
} from '@mui/material';
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
  selectAllHandler?: () => void | null;
  selectAllText?: string;
  pagination?: boolean;
  pageSize?: number;
  paginationProps?: PaginationProps & { ['data-cy']?: string };
  emptyListComponent?: ReactNode | null;
  disabled?: boolean;
}

export type TGenericItemsList = <ContainerId, ItemId>(
  props: React.PropsWithChildren<GenericItemsListProps<ContainerId, ItemId>>
) => React.ReactElement;

export const GenericItemsList: TGenericItemsList = ({
  listContainers,
  listTitle = '',
  titleProps,
  checkboxes = false,
  allSelected = false,
  selectAllHandler = null,
  selectAllText = '',
  pagination = false,
  pageSize = 5,
  paginationProps,
  emptyListComponent = null,
  disabled = false,
}) => {
  const classes = useStyles();
  const [page, setPage] = useState(1);

  const paginate = <ContainerId, ItemId>(
    allItems: ListItemsContainerProps<ContainerId, ItemId>[],
    itemsPerPage: number,
    currentPage: number
  ) => {
    return allItems
      ? allItems.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        )
      : [];
  };

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

      {checkboxes && listContainers?.length > 0 && (
        <div className={classes.selectAllHolder}>
          <Checkbox
            color="primary"
            checked={allSelected}
            onChange={selectAllHandler}
            disabled={disabled}
          />
          <Typography>{selectAllText || ''}</Typography>
        </div>
      )}

      {listContainers?.length > 0 ? (
        <List>
          {formattedItems.map((container) => (
            <ListItemsContainer
              key={`container-${container.id}`}
              checkboxes={checkboxes}
              disabled={disabled}
              {...container}
            />
          ))}
        </List>
      ) : (
        emptyListComponent
      )}

      {pagination && (
        <Pagination
          className={classes.pagination}
          size="small"
          defaultPage={1}
          count={
            listContainers?.length > 0
              ? Math.ceil(listContainers.length / pageSize)
              : 0
          }
          onChange={(event, index) => setPage(index)}
          {...paginationProps}
        />
      )}
    </Paper>
  );
};
