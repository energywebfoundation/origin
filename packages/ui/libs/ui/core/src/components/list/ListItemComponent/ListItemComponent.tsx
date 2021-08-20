import React from 'react';
import {
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemProps,
} from '@material-ui/core';
import { useStyles } from './ListItemComponent.styles';

export interface ListItemComponentProps<Id> {
  id: Id;
  itemContent: React.ReactNode;
  itemChecked?: boolean;
  handleItemCheck?: (id: Id) => void;
  checkboxes?: boolean;
  listItemProps?: ListItemProps;
  disabled?: boolean;
}

type TListItemsContainer = <Id>(
  props: React.PropsWithChildren<ListItemComponentProps<Id>>
) => React.ReactElement;

export const ListItemComponent: TListItemsContainer = ({
  id,
  itemChecked,
  handleItemCheck,
  itemContent,
  checkboxes,
  listItemProps,
  disabled = false,
}) => {
  const classes = useStyles();
  return (
    <ListItem className={classes.listItem} {...listItemProps}>
      {checkboxes && (
        <ListItemIcon classes={{ root: classes.listItemIcon }}>
          <Checkbox
            classes={{ root: classes.checkbox }}
            color="primary"
            checked={itemChecked}
            disabled={disabled}
            onChange={() => handleItemCheck(id)}
          />
        </ListItemIcon>
      )}
      {itemContent}
    </ListItem>
  );
};
