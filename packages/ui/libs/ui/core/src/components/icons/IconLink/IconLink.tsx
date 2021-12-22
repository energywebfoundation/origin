import { Box, BoxProps } from '@mui/material';
import React, { memo, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

export interface IconLinkProps {
  url: string;
  children: ReactNode;
  wrapperProps?: BoxProps;
}

export const IconLink = memo(
  ({ url, children, wrapperProps }: IconLinkProps) => {
    return (
      <Box {...wrapperProps}>
        <NavLink to={url}>{children}</NavLink>
      </Box>
    );
  }
);
