import {
  ListActionComponentProps,
  SelectRegular,
} from '@energyweb/origin-ui-core';
import { CircularProgress } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useRetireActionEffects } from './RetireAction.effects';
import { useStyles } from './RetireAction.styles';

interface RetireActionProps<Id> extends ListActionComponentProps<Id> {}

export type TRetireAction = <Id>(
  props: PropsWithChildren<RetireActionProps<Id>>
) => ReactElement;

export const RetireAction: TRetireAction = ({ selectedIds, resetIds }) => {
  const classes = useStyles();
  const {
    title,
    buttonText,
    selectedItems,
    retireHandler,
    isLoading,
    beneficiarySelectorProps,
    selectedBeneficiaryId,
    buttonDisabled,
  } = useRetireActionEffects(selectedIds, resetIds);

  if (isLoading) return <CircularProgress />;

  return (
    <CertificateActionContent
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={retireHandler}
      buttonDisabled={buttonDisabled}
    >
      <SelectRegular
        textFieldProps={{ margin: 'none', className: classes.selector }}
        value={selectedBeneficiaryId}
        {...beneficiarySelectorProps}
      />
    </CertificateActionContent>
  );
};
