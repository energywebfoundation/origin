/** @jsxRuntime classic */
/** @jsx jsx */
import { FC, memo } from 'react';
import { Box, Button, Toolbar } from '@material-ui/core';
import { jsx, css, useTheme } from '@emotion/react';
import { Theme } from '@material-ui/core/styles';
import { LightenColor } from '@energyweb/origin-ui-theme';

export type TopBarButtonData = {
  label: string;
  onClick: () => void;
};

export interface DesktopTopBarProps {
  buttons: TopBarButtonData[];
}

export const DesktopTopBar: FC<DesktopTopBarProps> = memo(({ buttons }) => {
  const theme = useTheme();

  const mode = (theme as Theme).palette?.mode;
  const textColor = (theme as Theme).palette?.text.secondary;
  const themeBgColor = (theme as Theme).palette?.background.paper;

  const btnColor = LightenColor(textColor, 5, mode);
  const btnHoverColor = LightenColor(themeBgColor, 10, mode);
  const toolbarBgColor = LightenColor(themeBgColor, 5, mode);

  const toolbarCss = css({
    backgroundColor: toolbarBgColor,
  });

  const buttonCss = css({
    color: btnColor,
    '&:hover': {
      backgroundColor: btnHoverColor,
    },
  });

  return (
    <Toolbar css={toolbarCss}>
      <Box flexGrow={1} />
      {buttons?.map(({ label, onClick }) => (
        <Button css={buttonCss} key={label} onClick={onClick}>
          {label}
        </Button>
      ))}
    </Toolbar>
  );
});
