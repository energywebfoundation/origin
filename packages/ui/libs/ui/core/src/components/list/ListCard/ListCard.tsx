import {
  Box,
  BoxProps,
  Card,
  CardProps,
  Checkbox,
  CheckboxProps,
} from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { useStyles } from './ListCard.styles';

export interface CardsListItem<Id> {
  id: Id;
  content: React.FC<{ id: Id }>;
  itemCardProps?: CardProps;
  checkbox?: boolean;
  checkboxWrapperProps?: BoxProps;
  checkboxProps?: Omit<CheckboxProps, 'value' | 'onChange'>;
  contentWrapperProps?: BoxProps;
}

interface ListCardProps<Id> {
  item: CardsListItem<Id>;
  selected: boolean;
  handleSelect: (id: Id) => void;
  selectOnCardClick?: boolean;
}

export type TListCard = <Id>(
  props: PropsWithChildren<ListCardProps<Id>>
) => ReactElement;

export const ListCard: TListCard = ({
  item,
  selected,
  handleSelect,
  selectOnCardClick,
}) => {
  const handleCardSelect = () => handleSelect(item.id);
  const { content: ItemContent } = item;
  const classes = useStyles();
  return (
    <Card
      className={`${classes.card} ${selected && classes.selected}`}
      {...item.itemCardProps}
      onClick={selectOnCardClick ? handleCardSelect : undefined}
    >
      <Box display="flex">
        {item.checkbox && (
          <Box {...item.checkboxWrapperProps}>
            <Checkbox
              color="primary"
              checked={selected}
              onChange={handleCardSelect}
              {...item.checkboxProps}
            />
          </Box>
        )}
        <Box {...item.contentWrapperProps}>
          <ItemContent id={item.id} />
        </Box>
      </Box>
    </Card>
  );
};
