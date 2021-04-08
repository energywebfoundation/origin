/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { FC, memo } from 'react';
import { Box, Button, Toolbar } from '@material-ui/core';
import { useComponentStyles } from './styles';

export type TopBarButtonData = {
  label: string;
  onClick: () => void;
};

export interface DesktopTopBarProps {
  buttons: TopBarButtonData[];
}

export const DesktopTopBar: FC<DesktopTopBarProps> = memo(({ buttons }) => {
  const { toolbarCss, buttonCss } = useComponentStyles();

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
