/** @jsxRuntime classic */
/** @jsx jsx */
import { Button, ListItem } from '@material-ui/core';
import { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { jsx } from '@emotion/react';
import { useComponentStyles } from './styles';

export interface MenuItemProps {
  label: string;
  url: string;
}

export const MenuItem: FC<MenuItemProps> = memo(({ label, url, ...props }) => {
  const { listItemCss, buttonCss } = useComponentStyles();
  return (
    <ListItem css={listItemCss} {...props}>
      <Button css={buttonCss} component={NavLink} to={url}>
        {label}
      </Button>
    </ListItem>
  );
});
