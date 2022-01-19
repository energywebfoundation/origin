import { Box, BoxProps } from '@mui/material';
import React, { FC, memo } from 'react';
import { TextWithPendingDot } from '../../text';
import { useStyles } from './UsernameAndOrg.styles';

export interface UsernameAndOrgProps {
  username: string;
  userPending?: boolean;
  userTooltip?: string;
  orgName?: string;
  orgPending?: boolean;
  orgTooltip?: string;
  wrapperProps?: BoxProps;
}

export const UsernameAndOrg: FC<UsernameAndOrgProps> = memo(
  ({
    username,
    userPending = false,
    userTooltip = '',
    orgName = '',
    orgPending = false,
    orgTooltip = '',
    wrapperProps,
  }) => {
    const classes = useStyles();
    return (
      <Box className={classes.wrapper} {...wrapperProps}>
        <Box flexGrow={1} />
        <Box>
          <TextWithPendingDot
            textContent={username}
            pending={userPending}
            tooltipText={userTooltip}
            typographyProps={{ variant: 'h6', component: 'span' }}
            dotWrapperProps={{ ['data-cy']: 'user-pending-badge' }}
          />
          {orgName ? (
            <TextWithPendingDot
              textContent={orgName}
              pending={orgPending}
              tooltipText={orgTooltip}
              typographyProps={{ color: 'textSecondary' }}
              dotWrapperProps={{ ['data-cy']: 'organization-pending-badge' }}
            />
          ) : null}
        </Box>
        <Box flexGrow={1} />
      </Box>
    );
  }
);
