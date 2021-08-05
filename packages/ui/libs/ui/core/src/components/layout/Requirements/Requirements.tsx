import React, { FC } from 'react';
import { Paper, CircularProgress } from '@material-ui/core';
import { Requirement } from '@energyweb/origin-ui-utils';
import { usePermissions } from '@energyweb/origin-ui-utils';
import { useStyles } from './Requirements.styles';
import { PermissionsFeedback } from '../PermissionsFeedback';

export interface RequirementsProps {
  rules?: Requirement[];
}

export const Requirements: FC<RequirementsProps> = ({ rules }): JSX.Element => {
  const classes = useStyles();
  const { loading, accessRules } = usePermissions(rules);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper className={classes?.container}>
      <PermissionsFeedback accessRules={accessRules} />
    </Paper>
  );
};
