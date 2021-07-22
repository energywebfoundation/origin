import { TableComponent } from '@energyweb/origin-ui-core';
import { Grid, Skeleton, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useInvitationsPageEffects } from './InvitationsPage.effects';

export const InvitationsPage: FC = () => {
  const {
    pageLoading,
    showSentTable,
    showReceivedTable,
    showNoInvitationsText,
    noInvitationsText,
    sentInvitationsTable,
    receivedInvitationsTable,
  } = useInvitationsPageEffects();

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
