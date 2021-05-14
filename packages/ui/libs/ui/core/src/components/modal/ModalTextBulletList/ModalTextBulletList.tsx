import {
  List,
  ListItem,
  ListItemProps,
  ListProps,
  Typography,
  TypographyProps,
} from '@material-ui/core';
import React, { FC } from 'react';

export interface ModalTextBulletListProps {
  heading: string;
  items: string[];
  headingProps?: TypographyProps;
  listProps?: ListProps;
  listItemProps?: ListItemProps;
}

export const ModalTextBulletList: FC<ModalTextBulletListProps> = ({
  heading,
  items,
  headingProps,
  listProps,
  listItemProps,
}) => {
  return (
    <>
      <Typography {...headingProps}>{heading}</Typography>
      <List dense {...listProps}>
        {items.map((item) => (
          <ListItem {...listItemProps}>{item}</ListItem>
        ))}
      </List>
    </>
  );
};
