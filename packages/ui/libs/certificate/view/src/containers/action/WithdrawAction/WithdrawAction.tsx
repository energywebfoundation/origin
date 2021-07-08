import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useWithdrawActionEffects } from './WithdrawAction.effects';

interface WithdrawActionProps<Id> extends ListActionComponentProps<Id> {}

export type TWithdrawAction = <Id>(
  props: PropsWithChildren<WithdrawActionProps<Id>>
) => ReactElement;

export const WithdrawAction: TWithdrawAction = ({ selectedIds, resetIds }) => {
  const { title, buttonText, selectedItems, withdrawHandler } =
    useWithdrawActionEffects(selectedIds, resetIds);

  return (
    <CertificateActionContent
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={withdrawHandler}
    />
  );
};
