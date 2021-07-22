import React from 'react';
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemProps,
} from '@material-ui/core';
import {
  ListItemComponent,
  ListItemComponentProps,
} from '../ListItemComponent';
import { useStyles } from './ListItemsContainer.styles';

export interface ListItemsContainerProps<ContainerId, ItemId> {
  id: ContainerId;
  containerHeader: React.ReactNode;
  containerItems: ListItemComponentProps<ItemId>[];
  isChecked?: boolean;
  handleContainerCheck?: (id: ContainerId) => void;
  checkboxes?: boolean;
  containerListItemProps?: ListItemProps;
  itemListItemProps?: ListItemProps;
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
  checkboxes,
  containerListItemProps,
  itemListItemProps,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <ListItem className={classes.header} {...containerListItemProps}>
        {checkboxes && (
          <ListItemIcon>
            <Checkbox
              color="primary"
              checked={isChecked}
              onChange={() => handleContainerCheck(id)}
            />
          </ListItemIcon>
        )}
        {containerHeader}
      </ListItem>
      <List className={classes.list}>
        {containerItems.map((item) => (
          <ListItemComponent
            key={`container-${id}-item-${item.id}`}
            checkboxes={checkboxes}
            listItemProps={itemListItemProps}
            {...item}
          />
        ))}
      </List>
    </div>
  );
};
