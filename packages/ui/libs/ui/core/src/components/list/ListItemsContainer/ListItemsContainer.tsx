import React from 'react';
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemProps,
} from '@mui/material';
import {
  ListItemComponent,
  ListItemComponentProps,
} from '../ListItemComponent';
import { useStyles } from './ListItemsContainer.styles';

export interface ListItemsContainerProps<ContainerId, ItemId> {
  id: ContainerId;
  containerHeader: React.ReactNode;
  containerItems: ListItemComponentProps<ItemId>[];
  checkboxes?: boolean;
  isChecked?: boolean;
  handleContainerCheck?: (id: ContainerId) => void;
  containerListItemProps?: ListItemProps;
  itemListItemProps?: ListItemProps;
  disabled?: boolean;
}

type TListItemsContainer = <ContainerId, ItemId>(
  props: React.PropsWithChildren<ListItemsContainerProps<ContainerId, ItemId>>
) => React.ReactElement;

export const ListItemsContainer: TListItemsContainer = ({
  id,
  handleContainerCheck,
  containerHeader,
  containerItems,
  checkboxes = false,
  isChecked = false,
  disabled = false,
  containerListItemProps,
  itemListItemProps,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <ListItem className={classes.header} {...containerListItemProps}>
        {checkboxes && (
          <ListItemIcon classes={{ root: classes.listItemIcon }}>
            <Checkbox
              classes={{ root: classes.checkbox }}
              color="primary"
              checked={isChecked}
              disabled={disabled}
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
            disabled={disabled}
            listItemProps={itemListItemProps}
            itemChecked={item.itemChecked || isChecked}
            {...item}
          />
        ))}
      </List>
    </div>
  );
};
