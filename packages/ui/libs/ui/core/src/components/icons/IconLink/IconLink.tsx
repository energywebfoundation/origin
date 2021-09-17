import { Box, BoxProps } from '@material-ui/core';
import React, { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';

export interface IconLinkProps {
  url: string;
  wrapperProps?: BoxProps;
}

export const IconLink: FC<IconLinkProps> = memo(
  ({ url, children, wrapperProps }) => {
    return (
      <Box {...wrapperProps}>
        <NavLink to={url}>{children}</NavLink>
      </Box>
    );
  }
);
