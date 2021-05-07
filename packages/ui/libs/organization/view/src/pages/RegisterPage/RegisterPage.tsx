import React, { FC } from 'react';
import { Paper } from '@material-ui/core';
import { MultiStepForm } from '@energyweb/origin-ui-core';

import { useRegisterOrganizationFormLogic } from '@energyweb/origin-ui-organization-logic';
import { submitOrganizationRegister } from '@energyweb/origin-ui-organization-data';

import { useStyles } from './RegisterPage.styles';
import { useTranslation } from 'react-i18next';

export const RegisterPage: FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const forms = useRegisterOrganizationFormLogic(t);
  return (
    <Paper classes={{ root: classes.paper }}>
      <MultiStepForm
        heading={t('organization.register.formTitle')}
        forms={forms}
        submitHandler={submitOrganizationRegister}
      />
    </Paper>
  );
};
