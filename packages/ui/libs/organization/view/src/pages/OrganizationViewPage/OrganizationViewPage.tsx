import React, { FC } from 'react';

import { DisabledFormView } from '@energyweb/origin-ui-core';
import { Box, CircularProgress, Typography } from '@material-ui/core';

import { useOrganizationViewPageEffects } from './OrganizationViewPage.effects';
import { useStyles } from './OrganizationViewPage.styles';
import { DownloadOrgDocs } from '../../containers/file';

export const OrganizationViewPage: FC = () => {
  const classes = useStyles();

  const {
    docsBlockHeading,
    pageLoading,
    orgFormData,
    iRecDataForms,
    showDocuments,
    showCompanyProofDocs,
    showSignatoryIdDocs,
    companyProofData,
    signatoryData,
  } = useOrganizationViewPageEffects();

  if (pageLoading) {
    return <CircularProgress />;
  }

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
      {iRecDataForms &&
        iRecDataForms.map((form) => (
          <DisabledFormView
            key={form.heading}
            paperClass={classes.paper}
            {...form}
          />
        ))}
    </Box>
  );
};
