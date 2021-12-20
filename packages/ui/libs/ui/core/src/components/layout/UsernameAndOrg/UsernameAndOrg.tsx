import { Box, BoxProps } from '@mui/material';
import React, { FC, memo } from 'react';
import { TextWithPendingDot } from '../../text';
import { useStyles } from './UsernameAndOrg.styles';

export interface UsernameAndOrgProps extends BoxProps {
  username: string;
  userPending?: boolean;
  userTooltip?: string;
  orgName: string;
  orgPending?: boolean;
  orgTooltip?: string;
}

export const UsernameAndOrg: FC<UsernameAndOrgProps> = memo(
  ({
    username,
    userPending,
    userTooltip,
    orgName,
    orgPending,
    orgTooltip,
    ...props
  }) => {
    const classes = useStyles();
    return (
      <Box className={classes.wrapper} {...props}>
        <Box flexGrow={1} />
        <Box>
          <TextWithPendingDot
            textContent={username}
            pending={userPending}
            tooltipText={userTooltip}
            typographyProps={{ variant: 'h6', component: 'span' }}
            dotWrapperProps={{ ['data-cy']: 'user-pending-badge' }}
          />
          <TextWithPendingDot
            textContent={orgName}
            pending={orgPending}
            tooltipText={orgTooltip}
            typographyProps={{ color: 'textSecondary' }}
            dotWrapperProps={{ ['data-cy']: 'organization-pending-badge' }}
          />
        </Box>
        <Box flexGrow={1} />
      </Box>
    );
  }
);
