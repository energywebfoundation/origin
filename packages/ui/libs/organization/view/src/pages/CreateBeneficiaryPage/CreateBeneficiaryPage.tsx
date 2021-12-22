import React, { FC } from 'react';

import { GenericForm, Requirements } from '@energyweb/origin-ui-core';
import { Paper } from '@mui/material';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useStyles } from './CreateBeneficiaryPage.styles';
import { useCreateBeneficiaryPageEffects } from './CreateBeneficiaryPage.effects';

export const CreateBeneficiaryPage: FC = () => {
  const { t } = useTranslation();
  const { formProps, canAccessPage, requirementsProps } =
    useCreateBeneficiaryPageEffects();
  const classes = useStyles();

  if (!canAccessPage) {
    return <Requirements {...requirementsProps} />;
  }

  return (
    <Paper classes={{ root: classes.paper }}>
      <Typography variant="h5" gutterBottom>
        {t('organization.createBeneficiary.formTitle')}
      </Typography>
      <GenericForm {...formProps} />
    </Paper>
  );
};

export default CreateBeneficiaryPage;
