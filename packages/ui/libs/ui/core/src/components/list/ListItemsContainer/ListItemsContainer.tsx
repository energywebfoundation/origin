import React from 'react';
import { Checkbox, List, ListItem, ListItemIcon } from '@material-ui/core';
import {
  ListItemComponent,
  ListItemComponentProps,
} from '../ListItemComponent';
import { useStyles } from './ListItemsContainer.styles';

export interface ListItemsContainerProps<ContainerId, ItemId> {
  id: ContainerId;
  isChecked: boolean;
  handleContainerCheck: (id: ContainerId) => void;
  containerHeader: React.ReactNode;
  containerItems: ListItemComponentProps<ItemId>[];
}

type TListItemsContainer = <ContainerId, ItemId>(
  props: React.PropsWithChildren<ListItemsContainerProps<ContainerId, ItemId>>
) => React.ReactElement;

export const ListItemsContainer: TListItemsContainer = ({
  id,
  isChecked,
  handleContainerCheck,
  containerHeader,
  containerItems,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <ListItem className={classes.header}>
        <ListItemIcon>
          <Checkbox
            color="primary"
            checked={isChecked}
            onChange={() => handleContainerCheck(id)}
          />
        </ListItemIcon>
        {containerHeader}
      </ListItem>
      <List className={classes.list}>
        {containerItems.map((item) => (
          <ListItemComponent
            key={`container-${id}-item-${item.id}`}
            {...item}
          />
        ))}
      </List>
    </div>
  );
};
