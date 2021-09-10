import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useWithdrawActionEffects } from './WithdrawAction.effects';

type WithdrawActionProps = ListActionComponentProps<
  AccountAssetDTO['asset']['id']
>;

export type TWithdrawAction = (
  props: PropsWithChildren<WithdrawActionProps>
) => ReactElement;

export const WithdrawAction: TWithdrawAction = ({ selectedIds, resetIds }) => {
  const {
    title,
    buttonText,
    selectedItems,
    withdrawHandler,
  } = useWithdrawActionEffects(selectedIds, resetIds);

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
