import { DisabledFormView } from '@energyweb/origin-ui-core';
import { myOrgData } from '@energyweb/origin-ui-organization-logic';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './MyOrganizationPage.styles';

export const MyOrganizationPage: FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <DisabledFormView
      paperClass={classes.paper}
      data={myOrgData}
      heading={t('organization.view.title')}
    />
  );
};
