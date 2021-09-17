import { TableComponent } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { usePendingPageEffects } from './PendingPage.effects';

export const PendingPage: FC = () => {
  const tableProps = usePendingPageEffects();
  return <TableComponent {...tableProps} />;
};
