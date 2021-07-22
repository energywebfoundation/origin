import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useDepositActionEffects } from './DepositAction.effects';

interface DepositActionProps<Id> extends ListActionComponentProps<Id> {}

export type TDepositAction = <Id>(
  props: PropsWithChildren<DepositActionProps<Id>>
) => ReactElement;

export const DepositAction: TDepositAction = ({ selectedIds, resetIds }) => {
  const { title, buttonText, selectedItems, depositHandler, isLoading } =
    useDepositActionEffects(selectedIds, resetIds);

  if (isLoading) return <CircularProgress />;

  return (
    <CertificateActionContent
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={depositHandler}
    />
  );
};
