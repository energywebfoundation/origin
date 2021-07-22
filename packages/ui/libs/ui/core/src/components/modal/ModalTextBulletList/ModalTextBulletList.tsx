import {
  List,
  ListItem,
  ListItemIcon,
  ListItemIconProps,
  ListItemProps,
  ListItemText,
  ListItemTextProps,
  ListProps,
  SvgIconProps,
  Typography,
  TypographyProps,
} from '@material-ui/core';
import { Brightness1 } from '@material-ui/icons';
import React, { FC } from 'react';

export interface ModalTextBulletListProps {
  heading: string;
  items: string[];
  headingProps?: TypographyProps;
  listProps?: ListProps;
  listItemProps?: ListItemProps;
  listItemIconProps?: ListItemIconProps;
  bulletIconProps?: SvgIconProps;
  listItemTextProps?: ListItemTextProps;
}

export const ModalTextBulletList: FC<ModalTextBulletListProps> = ({
  heading,
  items,
  headingProps,
  listProps,
  listItemProps,
  listItemIconProps,
  bulletIconProps,
  listItemTextProps,
}) => {
  return (
    <>
      <Typography {...headingProps}>{heading}</Typography>
      <List dense {...listProps}>
        {items.map((item) => (
          <ListItem key={item} {...listItemProps}>
            <ListItemIcon {...listItemIconProps}>
              <Brightness1 {...bulletIconProps} />
            </ListItemIcon>
            <ListItemText {...listItemTextProps}>{item}</ListItemText>
          </ListItem>
        ))}
      </List>
    </>
  );
};
