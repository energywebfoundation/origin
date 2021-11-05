import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { useMyBundlesPageEffects } from './MyBundlesPage.effects';
import { useStyles } from './MyBundlesPage.styles';

export const MyBundlesPage: FC = () => {
  const { tableData, canAccessPage, requirementsProps } =
    useMyBundlesPageEffects();
  const classes = useStyles();

  if (!canAccessPage) {
    return <Requirements {...requirementsProps} />;
  }

  return (
    <div className={classes.wrapper}>
      <TableComponent {...tableData} />
    </div>
  );
};
