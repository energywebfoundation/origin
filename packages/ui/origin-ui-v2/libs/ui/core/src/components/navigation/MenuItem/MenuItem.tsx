/** @jsxRuntime classic */
/** @jsx jsx */
import { Button, ListItem } from '@material-ui/core';
import { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { jsx, css, useTheme } from '@emotion/react';
import { Theme } from '@material-ui/core/styles';
import { LightenColor } from '@energyweb/origin-ui-theme';

export interface MenuItemProps {
  label: string;
  url: string;
}

const listItemCss = css({
  padding: 0,
});

export const MenuItem: FC<MenuItemProps> = memo(({ label, url, ...props }) => {
  const theme = useTheme();

  const mode = (theme as Theme).palette?.mode;
  const textColor = (theme as Theme).palette?.text.secondary;
  const themeBgColor = (theme as Theme).palette?.background.paper;

  const buttonColor = LightenColor(textColor, 5, mode);
  const hoverBgColor = LightenColor(themeBgColor, 5, mode);

  const buttonCss = css({
    justifyContent: 'flex-start',
    textTransform: 'none',
    padding: '10px 8px',
    width: '100%',
    margin: '0',
    color: buttonColor,
    '&:hover': {
      backgroundColor: hoverBgColor,
    },
  });

  return (
    <ListItem css={listItemCss} {...props}>
      <Button css={buttonCss} component={NavLink} to={url}>
        {label}
      </Button>
    </ListItem>
  );
});
