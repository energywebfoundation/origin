import React, { PropsWithChildren, ReactElement } from 'react';
import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { CertificateActionContent } from '../../list';
import { useClaimActionEffects } from './ClaimAction.effects';

type ClaimActionProps = ListActionComponentProps<
  AccountAssetDTO['asset']['id']
>;

export type TClaimAction = (
  props: PropsWithChildren<ClaimActionProps>
) => ReactElement;

export const ClaimAction: TClaimAction = ({ selectedIds, resetIds }) => {
  const { title, buttonText, selectedItems, withdrawHandler } =
    useClaimActionEffects(selectedIds, resetIds);

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
