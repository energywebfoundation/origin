import { Box, BoxProps } from '@material-ui/core';
import React, { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';

export interface IconLinkProps extends BoxProps {
  url: string;
}

export const IconLink: FC<IconLinkProps> = memo(
  ({ url, children, ...props }) => {
    return (
      <Box {...props}>
        <NavLink to={url}>{children}</NavLink>
      </Box>
    );
  }
);
