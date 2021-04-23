// @should localize
import { DisabledFormView } from '@energyweb/origin-ui-core';
import { myOrgData } from '@energyweb/origin-ui-organization-logic';
import React, { FC } from 'react';
import { useStyles } from './MyOrganizationPage.styles';

export const MyOrganizationPage: FC = () => {
  const classes = useStyles();
  return (
    <>
      <DisabledFormView
        paperClass={classes.paper}
        data={myOrgData}
        heading="Organization Information"
      />
    </>
  );
};
