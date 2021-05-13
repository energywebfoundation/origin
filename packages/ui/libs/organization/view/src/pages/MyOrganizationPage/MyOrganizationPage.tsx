import React, { FC } from 'react';

import { DisabledFormView } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@material-ui/core';

import { useMyOrganizationPageEffects } from './MyOrganizationPage.effects';
import { useStyles } from './MyOrganizationPage.styles';

export const MyOrganizationPage: FC = () => {
  const classes = useStyles();
  const { isLoading, ...formData } = useMyOrganizationPageEffects();

  if (isLoading) {
    return <CircularProgress />;
  }

  return <DisabledFormView paperClass={classes.paper} {...formData} />;
};
