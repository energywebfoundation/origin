import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useDepositActionEffects } from './DepositAction.effects';

type DepositActionProps = ListActionComponentProps<CertificateDTO['id']>;

export type TDepositAction = (
  props: PropsWithChildren<DepositActionProps>
) => ReactElement;

export const DepositAction: TDepositAction = ({ selectedIds, resetIds }) => {
  const {
    title,
    buttonText,
    selectedItems,
    depositHandler,
    isLoading,
  } = useDepositActionEffects(selectedIds, resetIds);

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
