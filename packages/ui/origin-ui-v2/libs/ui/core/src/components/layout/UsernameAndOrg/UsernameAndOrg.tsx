import { Box, BoxProps } from '@material-ui/core';
import React, { FC, memo } from 'react';
import { TextWithPendingDot } from '../../utils';
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
            variant="h6"
          />
          <TextWithPendingDot
            textContent={orgName}
            pending={orgPending}
            tooltipText={orgTooltip}
          />
        </Box>
        <Box flexGrow={1} />
      </Box>
    );
  }
);
