/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css, useTheme } from '@emotion/react';
import { Button, ListItem } from '@material-ui/core';
import { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Theme } from '@material-ui/core/styles';
import { LightenColor } from '@energyweb/origin-ui-theme';

export interface NavSectionTitleProps {
  url: string;
  title: string;
}

const listItemCss = css({
  padding: 0,
});

export const NavSectionTitle: FC<NavSectionTitleProps> = memo(
  ({ url, title }) => {
    const theme = useTheme();

    const mode = (theme as Theme).palette?.mode;
    const textColor = (theme as Theme).palette?.text.primary;
    const themeBgColor = (theme as Theme).palette?.background.paper;
    const hoverBgColor = LightenColor(themeBgColor, 5, mode);

    const buttonCss = css({
      justifyContent: 'flex-start',
      fontWeight: 600,
      letterSpacing: '0.1rem',
      padding: '10px 8px',
      width: '100%',
      color: textColor,
      '&:hover': {
        backgroundColor: hoverBgColor,
      },
    });

    return (
      <ListItem css={listItemCss} disableGutters>
        <Button css={buttonCss} component={NavLink} to={url}>
          {title}
        </Button>
      </ListItem>
    );
  }
);
