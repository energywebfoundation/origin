/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import { Box } from '@material-ui/core';
import { FC, memo } from 'react';
import { TextWithPendingDot } from '../../utils';

export interface UsernameAndOrgProps {
  username: string;
  userPending?: boolean;
  userTooltip?: string;
  orgName: string;
  orgPending?: boolean;
  orgTooltip?: string;
}

const Wrapper = styled(Box)`
  display: flex,
  margin: 20px 0
`;

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
    return (
      <Wrapper {...props}>
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
      </Wrapper>
    );
  }
);
