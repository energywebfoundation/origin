import { TableComponent } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { useMyBundlesPageEffects } from './MyBundlesPage.effects';
import { useStyles } from './MyBundlesPage.styles';

export const MyBundlesPage: FC = () => {
  const tableData = useMyBundlesPageEffects();
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <TableComponent {...tableData} />
    </div>
  );
};
