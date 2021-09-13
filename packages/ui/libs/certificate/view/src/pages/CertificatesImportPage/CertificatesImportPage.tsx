import React from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { CertificatesToImportList } from '../../containers';
import { useCertificatesImportPageEffects } from './CertificatesImportPage.effects';
import { useStyles } from './CertificatesImportPage.styles';

export const CertificatesImportPage = () => {
  const classes = useStyles();
  const { allFuelTypes, isLoading } = useCertificatesImportPageEffects();

  if (isLoading) return <CircularProgress />;

  return (
    <div className={classes.wrapper}>
      <Box width="60%" mx="auto">
        <CertificatesToImportList allFuelTypes={allFuelTypes} />
      </Box>
    </div>
  );
};
