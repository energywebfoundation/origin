import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useRetireActionEffects } from './RetireAction.effects';

interface RetireActionProps<Id> extends ListActionComponentProps<Id> {}

export type TRetireAction = <Id>(
  props: PropsWithChildren<RetireActionProps<Id>>
) => ReactElement;

export const RetireAction: TRetireAction = ({ selectedIds, resetIds }) => {
  const { title, buttonText, selectedItems, retireHandler, isLoading } =
    useRetireActionEffects(selectedIds, resetIds);

  if (isLoading) return <CircularProgress />;

  return (
    <CertificateActionContent
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={retireHandler}
    />
  );
};
