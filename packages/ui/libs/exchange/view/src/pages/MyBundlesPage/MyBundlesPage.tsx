import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { useMyBundlesPageEffects } from './MyBundlesPage.effects';
import { useStyles } from './MyBundlesPage.styles';

export const MyBundlesPage: FC = () => {
  const { tableData, permissions } = useMyBundlesPageEffects();
  const classes = useStyles();

  if (!permissions.canAccessPage) {
    return <Requirements {...permissions} />;
  }

  return (
    <div className={classes.wrapper}>
      <TableComponent {...tableData} />
    </div>
  );
};
