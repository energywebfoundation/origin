import React, { memo, ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import { OriginGenericLogo } from './OriginGenericLogo';

export const SidebarMenuHomeLink = memo(
    ({ defaultPageUrl }: { defaultPageUrl: string }): ReactElement => {
        return (
            <Box className="Logo">
                <NavLink to={defaultPageUrl}>
                    <OriginGenericLogo />
                </NavLink>
            </Box>
        );
    }
);

SidebarMenuHomeLink.displayName = 'SidebarMenuHomeLink';
