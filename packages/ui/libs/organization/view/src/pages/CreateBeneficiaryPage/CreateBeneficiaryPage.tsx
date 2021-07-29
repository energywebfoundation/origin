import React, { FC } from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { Paper } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useStyles } from './CreateBeneficiaryPage.styles';
import { useCreateBeneficiaryPageEffects } from './CreateBeneficiaryPage.effects';

export const CreateBeneficiaryPage: FC = () => {
  const { t } = useTranslation();
  const { formProps } = useCreateBeneficiaryPageEffects();
  const classes = useStyles();

  return (
    <Paper classes={{ root: classes.paper }}>
      <Typography variant="h5" gutterBottom>
        {t('organization.createBeneficiary.formTitle')}
      </Typography>
      <GenericForm {...formProps} />
    </Paper>
  );
};
