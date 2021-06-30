import React from 'react';
import { Checkbox, ListItem, ListItemIcon } from '@material-ui/core';
import { useStyles } from './ListItemComponent.styles';

export interface ListItemComponentProps<Id> {
  id: Id;
  itemContent: React.ReactNode;
  itemChecked?: boolean;
  handleItemCheck?: (id: Id) => void;
  checkboxes?: boolean;
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
}) => {
  const classes = useStyles();
  return (
    <ListItem className={classes.listItem}>
      {checkboxes && (
        <ListItemIcon>
          <Checkbox
            color="primary"
            checked={itemChecked}
            onChange={() => handleItemCheck(id)}
          />
        </ListItemIcon>
      )}
      {itemContent}
    </ListItem>
  );
};
