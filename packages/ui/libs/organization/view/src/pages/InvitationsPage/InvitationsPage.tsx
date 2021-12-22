import { TableComponent } from '@energyweb/origin-ui-core';
import { Grid, Skeleton, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useInvitationsPageEffects } from './InvitationsPage.effects';

interface InvitationsPageProps {
  redirectToIndex: boolean;
}

export const InvitationsPage: FC<InvitationsPageProps> = ({
  redirectToIndex,
}) => {
  const {
    pageLoading,
    showSentTable,
    showReceivedTable,
    showNoInvitationsText,
    noInvitationsText,
    sentInvitationsTable,
    receivedInvitationsTable,
  } = useInvitationsPageEffects(redirectToIndex);

  if (pageLoading) {
    return (
      <>
        <Skeleton width="100%" height={300} />
        <Skeleton width="100%" height={300} />
      </>
    );
  }

  return (
    <Grid container spacing={4}>
      {showSentTable && (
        <Grid item xs={12}>
          <TableComponent {...sentInvitationsTable} />
        </Grid>
      )}

      {showReceivedTable && (
        <Grid item xs={12}>
          <TableComponent {...receivedInvitationsTable} />
        </Grid>
      )}

      {showNoInvitationsText && (
        <Grid item xs={12}>
          <Typography textAlign="center" variant="h5">
            {noInvitationsText}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default InvitationsPage;
