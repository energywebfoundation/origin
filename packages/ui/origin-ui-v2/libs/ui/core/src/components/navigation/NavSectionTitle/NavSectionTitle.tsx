/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { Button, ListItem } from '@material-ui/core';
import { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useComponentStyles } from './styles';

export interface NavSectionTitleProps {
  url: string;
  title: string;
}

export const NavSectionTitle: FC<NavSectionTitleProps> = memo(
  ({ url, title }) => {
    const { listItemCss, buttonCss } = useComponentStyles();
    return (
      <ListItem css={listItemCss} disableGutters>
        <Button css={buttonCss} component={NavLink} to={url}>
          {title}
        </Button>
      </ListItem>
    );
  }
);
