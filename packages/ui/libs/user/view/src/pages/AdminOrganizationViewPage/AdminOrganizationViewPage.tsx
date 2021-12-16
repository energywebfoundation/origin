import React, { FC } from 'react';

import { DisabledFormView } from '@energyweb/origin-ui-core';
import { Box, CircularProgress, Typography } from '@mui/material';

import { DownloadOrgDocs } from '../../containers';
import { useAdminOrganizationViewPageEffects } from './AdminOrganizationViewPage.effects';
import { useStyles } from './AdminOrganizationViewPage.styles';

export const AdminOrganizationViewPage: FC = () => {
  const classes = useStyles();

  const {
    docsBlockHeading,
    pageLoading,
    orgFormData,
    showDocuments,
    showCompanyProofDocs,
    showSignatoryIdDocs,
    companyProofData,
    signatoryData,
  } = useAdminOrganizationViewPageEffects();

  if (pageLoading) return <CircularProgress />;

  return (
    <Box>
      <DisabledFormView paperClass={classes.paper} {...orgFormData} />

      {showDocuments && (
        <>
          <Box>
            <Typography>{docsBlockHeading}</Typography>
          </Box>
          {showCompanyProofDocs && (
            <Box>
              <DownloadOrgDocs {...companyProofData} />
            </Box>
          )}
          {showSignatoryIdDocs && (
            <Box>
              <DownloadOrgDocs {...signatoryData} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
