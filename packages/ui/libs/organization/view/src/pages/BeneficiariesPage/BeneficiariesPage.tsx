import React, { FC } from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { Paper } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useStyles } from './BeneficiariesPage.styles';
import { useBeneficiariesPageEffects } from './BeneficiariesPage.effects';

export const BeneficiariesPage: FC = () => {
  const { t } = useTranslation();
  const { formProps } = useBeneficiariesPageEffects();
  const classes = useStyles();

  return (
    <Paper classes={{ root: classes.paper }}>
      <Typography variant="h5" gutterBottom>
        {t('organization.beneficiaries.formTitle')}
      </Typography>
      <GenericForm {...formProps} />
    </Paper>
  );
};
