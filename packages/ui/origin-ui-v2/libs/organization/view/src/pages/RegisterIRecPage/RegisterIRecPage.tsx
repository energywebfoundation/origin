import React, { FC } from 'react';
import { Paper } from '@material-ui/core';
import { MultiStepForm } from '@energyweb/origin-ui-core';

import { useRegisterIRecFormLogic } from '@energyweb/origin-ui-organization-logic';
import { submitIRecRegistration } from '@energyweb/origin-ui-organization-data';

import { useStyles } from './RegisterIRecPage.styles';
import { useTranslation } from 'react-i18next';

export const RegisterIRecPage: FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const forms = useRegisterIRecFormLogic(t);

  return (
    <Paper classes={{ root: classes.paper }}>
      <MultiStepForm
        heading={t('organization.registerIRec.registerOrgInIRec')}
        forms={forms}
        submitHandler={submitIRecRegistration}
      />
    </Paper>
  );
};
